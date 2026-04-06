import fs from 'fs';

async function run() {
  const exercises = [
    'Dumbbell shoulder thrusters',
    'Jumping Jacks',
    'Burpees',
    'Mountain Climbers',
    'Crunches',
    'Treadmill Workout (Beginner)',
    'Dumbbell Flat bench press',
    'Dumbbell Incline bench press',
    'Overhead tricep extension - seated',
    'Dumbbell Lateral Raise',
    'Seated Rowing - Single arm',
    'Dumbbell Biceps Curls',
    'Dumbbell Hammer Curls',
    'Incline Treadmill',
    'Smith Machine Back Squats',
    'Leg Extension',
    'Seated Leg Curls',
    'Seated Dumbbell calf raises',
    'Cycling',
    'Lat Pulldown - Wide Grip Bar',
    'Barbell Bent-over Row',
    'Barbell Biceps Curls',
    'Machine fly',
    'Skull Crusher - EZ Bar',
    'Dumbbell Front Raise',
    'Cable Face Pull',
    'Goblet Squats',
    'Walking Lunges',
    'Farmer Walks'
  ];

  const exactMatches: Record<string, string> = {
    'Dumbbell shoulder thrusters': 'Dumbbell Thruster',
    'Jumping Jacks': 'Jumping Jack',
    'Burpees': 'Burpee',
    'Dumbbell Lateral Raise': 'Dumbbell Lateral Raise',
    'Seated Rowing - Single arm': 'Cable Seated One Arm Alternate Row',
    'Incline Treadmill': 'Walk on treadmill',
    'Smith Machine Back Squats': 'Smith Squat',
    'Seated Leg Curls': 'Lever Seated Leg Curl',
    'Barbell Bent-over Row': 'Barbell Bent Over Row',
    'Farmer Walks': 'Farmers Walk'
  };

  const res = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
  const db = await res.json();
  
  const mapped: Record<string, any> = {};
  
  for (const ex of exercises) {
    let bestMatch = null;
    
    // Check exact override first
    if (exactMatches[ex]) {
      bestMatch = db.find((d: any) => d.name.toLowerCase() === exactMatches[ex].toLowerCase());
    }
    
    // Fallback to fuzzy search
    if (!bestMatch) {
      const search = ex.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
      let bestScore = 0;
      
      for (const dbEx of db) {
        const dbName = dbEx.name.toLowerCase();
        let score = 0;
        for (const word of search) {
          if (word.length > 2 && dbName.includes(word)) {
            score++;
          }
        }
        if (score > bestScore) {
          bestScore = score;
          bestMatch = dbEx;
        }
      }
    }
    
    if (bestMatch) {
      mapped[ex] = {
        name: bestMatch.name,
        image: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/" + bestMatch.images[0],
        image2: bestMatch.images[1] ? "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/" + bestMatch.images[1] : null,
        instructions: bestMatch.instructions.join('\\n\\n')
      };
    } else {
      mapped[ex] = {
        name: ex,
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
        image2: null,
        instructions: "1. Maintain proper form.\\n2. Control the movement.\\n3. Breathe steadily throughout the exercise."
      };
    }
  }
  
  const fileContent = "export const exerciseMapping: Record<string, { name: string; image: string; image2?: string | null; instructions: string }> = " + JSON.stringify(mapped, null, 2) + ";\n";
  fs.writeFileSync('src/lib/exercise-mapping.ts', fileContent);
  console.log("Done");
}

run();
