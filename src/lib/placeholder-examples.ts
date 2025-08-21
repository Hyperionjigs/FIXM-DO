// Utility function to generate randomized placeholder examples for post forms

const taskExamples = [
  "Need a reliable plumber for bathroom renovation",
  "Looking for a skilled electrician to install ceiling fans",
  "Seeking professional house painter for interior walls",
  "Need help with moving furniture this weekend",
  "Looking for a gardener to maintain backyard landscape",
  "Seeking a carpenter to build custom bookshelves",
  "Need a handyman to fix leaky faucet and door locks",
  "Looking for a professional cleaner for deep house cleaning",
  "Seeking a tutor for high school math and science",
  "Need assistance with computer setup and software installation",
  "Looking for a pet sitter for weekend care",
  "Seeking a photographer for family portrait session",
  "Need help with grocery shopping and meal preparation",
  "Looking for a driver for airport pickup service",
  "Seeking a babysitter for evening childcare"
];

const serviceExamples = [
  "Professional house cleaning service in Makati",
  "Experienced web developer for custom website design",
  "Skilled graphic designer for logo and branding",
  "Professional photographer for events and portraits",
  "Certified personal trainer for home fitness sessions",
  "Experienced tutor for academic subjects",
  "Professional chef for private dining events",
  "Skilled carpenter for custom furniture making",
  "Professional makeup artist for special occasions",
  "Experienced driver for transportation services",
  "Skilled masseuse for home massage therapy",
  "Professional event planner for celebrations",
  "Experienced pet groomer for pet care services",
  "Skilled handyman for home repairs and maintenance",
  "Professional organizer for home decluttering"
];

export function getRandomPlaceholder(type: 'task' | 'service'): string {
  const examples = type === 'task' ? taskExamples : serviceExamples;
  const randomIndex = Math.floor(Math.random() * examples.length);
  return `e.g., ${examples[randomIndex]}`;
}

export function getRandomPlaceholderPair(): { task: string; service: string } {
  const taskExample = taskExamples[Math.floor(Math.random() * taskExamples.length)];
  const serviceExample = serviceExamples[Math.floor(Math.random() * serviceExamples.length)];
  
  return {
    task: `e.g., '${taskExample}'`,
    service: `e.g., '${serviceExample}'`
  };
} 