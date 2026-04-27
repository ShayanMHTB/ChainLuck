#!/bin/bash

set -e

echo "🕐 Redistribute Commits Between Dates (Weekdays & Work Hours Only)"
read -p "Enter start date (YYYY-MM-DD): " start_date
read -p "Enter end date (YYYY-MM-DD): " end_date

start_ts=$(date -j -f "%Y-%m-%d" "$start_date" "+%s")
end_ts=$(date -j -f "%Y-%m-%d" "$end_date" "+%s")

if [ "$start_ts" -ge "$end_ts" ]; then
  echo "❌ End date must be after start date"
  exit 1
fi

# Get all commits in reverse (oldest to newest)
commits=()
while read -r commit; do
  commits+=("$commit")
done < <(git rev-list --reverse HEAD)

count=${#commits[@]}
if [ "$count" -lt 2 ]; then
  echo "❌ Need at least 2 commits to redistribute."
  exit 1
fi

echo "🔢 Found $count commits. Generating realistic weekday timestamps..."

# Generate valid weekday timestamps between 9am–6pm
valid_ts=()
day_secs=$((24 * 3600))

for ((ts = start_ts; ts <= end_ts; ts += day_secs)); do
  # Check if weekday (1 = Monday, 7 = Sunday)
  dow=$(date -j -f "%s" "$ts" "+%u")
  if [ "$dow" -ge 6 ]; then
    continue  # skip Saturday(6) and Sunday(7)
  fi

  # Generate a few timestamps for this day (e.g., morning, midday, afternoon)
  for _ in {1..3}; do
    hour=$((9 + RANDOM % 9))  # 9am–5pm
    minute=$((RANDOM % 60))
    second=$((RANDOM % 60))
    timestamp=$(date -j -f "%s" "$ts" "+%Y-%m-%d")T$(printf "%02d:%02d:%02d" "$hour" "$minute" "$second")
    full_ts=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$timestamp" "+%s")
    valid_ts+=("$full_ts")
  done
done

if [ "${#valid_ts[@]}" -lt "$count" ]; then
  echo "❌ Not enough valid weekday timestamps in this range for $count commits."
  exit 1
fi

# Shuffle and pick `count` timestamps
shuffled_ts=($(printf "%s\n" "${valid_ts[@]}" | sort -R | head -n $count | sort -n))

# Build map of commit → timestamp
mapfile=".commit_date_map.txt"
> "$mapfile"
for ((i = 0; i < count; i++)); do
  echo "${commits[$i]} ${shuffled_ts[$i]}" >> "$mapfile"
done

# Create the custom sequence editor
editor_script=".custom_sequence_editor.sh"
cat <<'EOF' > "$editor_script"
#!/bin/bash
mapfile=".commit_date_map.txt"
todo_file="$1"
temp_file=".rebase-todo-modified"

> "$temp_file"

while IFS= read -r line; do
  echo "$line" >> "$temp_file"

  if [[ "$line" =~ ^pick ]]; then
    sha=$(echo "$line" | awk '{print $2}')
    ts=$(grep "$sha" "$mapfile" | awk '{print $2}')
    date_str=$(date -j -f "%s" "$ts" "+%a %b %d %T %Y %z")

    echo "exec GIT_COMMITTER_DATE=\"$date_str\" GIT_AUTHOR_DATE=\"$date_str\" git commit --amend --no-edit --date \"$date_str\"" >> "$temp_file"
    echo "exec echo \"✅ $sha → $date_str\"" >> "$temp_file"
  fi
done < "$todo_file"

mv "$temp_file" "$todo_file"
EOF

chmod +x "$editor_script"

echo "📦 Starting interactive rebase with realistic timestamps..."
GIT_SEQUENCE_EDITOR="./$editor_script" git rebase -i --root

# Cleanup
rm -f "$mapfile" "$editor_script" .rebase-todo-modified 2>/dev/null || true

echo ""
echo "✅ All commit timestamps updated!"
echo "🧪 Check with:"
echo "   git log --reverse --pretty='%h | %ad | %s'"
echo ""
echo "🚀 Push with:"
echo "   git push -f origin main"
