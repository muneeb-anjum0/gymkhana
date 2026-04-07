insert into public.exercise_library (
  slug,
  name,
  category,
  primary_muscle,
  secondary_muscles,
  equipment,
  default_sets,
  default_reps,
  instructions
)
values
  ('barbell-back-squat', 'Barbell Back Squat', 'compound', 'Quads', array['Glutes', 'Core'], 'Barbell', 4, '5-8', 'Brace hard, sit between your hips, and keep pressure through the mid-foot.'),
  ('romanian-deadlift', 'Romanian Deadlift', 'compound', 'Hamstrings', array['Glutes', 'Back'], 'Barbell', 4, '6-10', 'Push the hips back, keep a neutral spine, and stop when the hamstrings load.'),
  ('barbell-bench-press', 'Barbell Bench Press', 'compound', 'Chest', array['Triceps', 'Shoulders'], 'Barbell', 4, '5-8', 'Set the shoulder blades, touch lower chest, and drive the bar back toward the rack.'),
  ('incline-dumbbell-press', 'Incline Dumbbell Press', 'compound', 'Upper Chest', array['Triceps', 'Shoulders'], 'Dumbbells', 3, '8-12', 'Lower with control and press slightly inward on the way up.'),
  ('pull-up', 'Pull-Up', 'compound', 'Lats', array['Biceps', 'Upper Back'], 'Bodyweight', 4, 'AMRAP', 'Start from a dead hang, pull elbows to ribs, and finish with the chest tall.'),
  ('seated-cable-row', 'Seated Cable Row', 'compound', 'Mid Back', array['Lats', 'Rear Delts'], 'Cable Machine', 3, '8-12', 'Keep the torso quiet and squeeze the shoulder blades together at the finish.'),
  ('overhead-press', 'Overhead Press', 'compound', 'Shoulders', array['Triceps', 'Core'], 'Barbell', 4, '5-8', 'Stack the wrists over elbows, keep the ribs down, and press in a straight line.'),
  ('goblet-squat', 'Goblet Squat', 'accessory', 'Quads', array['Glutes', 'Core'], 'Dumbbell', 3, '10-15', 'Use the weight as a counterbalance and keep the chest tall throughout the rep.'),
  ('walking-lunge', 'Walking Lunge', 'accessory', 'Glutes', array['Quads', 'Hamstrings'], 'Dumbbells', 3, '8-12', 'Step far enough to stack the front shin and keep the pelvis level.'),
  ('lat-pulldown', 'Lat Pulldown', 'accessory', 'Lats', array['Biceps', 'Upper Back'], 'Cable Machine', 3, '8-12', 'Pull the elbows down into the pockets and avoid turning it into a row.'),
  ('chest-supported-row', 'Chest Supported Row', 'accessory', 'Upper Back', array['Lats', 'Rear Delts'], 'Bench + Dumbbells', 3, '10-12', 'Let the chest stay pinned to the pad and finish with a hard squeeze.'),
  ('dumbbell-lateral-raise', 'Dumbbell Lateral Raise', 'isolation', 'Side Delts', array['Upper Traps'], 'Dumbbells', 3, '12-20', 'Lead with the elbows and stop slightly below shoulder height if needed.'),
  ('triceps-rope-pushdown', 'Triceps Rope Pushdown', 'isolation', 'Triceps', array['Forearms'], 'Cable Machine', 3, '10-15', 'Keep the elbows pinned and fully separate the rope at the bottom.'),
  ('dumbbell-curl', 'Dumbbell Curl', 'isolation', 'Biceps', array['Forearms'], 'Dumbbells', 3, '10-15', 'Keep the shoulder still and finish each rep without swinging.'),
  ('plank', 'Plank', 'conditioning', 'Core', array['Glutes', 'Shoulders'], 'Bodyweight', 3, '30-60s', 'Stack ribs over pelvis and keep breathing behind a braced torso.'),
  ('bike-intervals', 'Bike Intervals', 'conditioning', 'Conditioning', array['Legs', 'Heart Rate'], 'Stationary Bike', 1, '10-20 min', 'Alternate hard efforts with controlled recovery to keep output high.')
on conflict (slug) do update
set name = excluded.name,
    category = excluded.category,
    primary_muscle = excluded.primary_muscle,
    secondary_muscles = excluded.secondary_muscles,
    equipment = excluded.equipment,
    default_sets = excluded.default_sets,
    default_reps = excluded.default_reps,
    instructions = excluded.instructions;