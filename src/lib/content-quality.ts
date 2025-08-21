import * as z from 'zod';

/**
 * Content Quality Validation Utilities
 * 
 * This module provides functions to validate and assess the quality of user-generated content,
 * specifically for task and service postings. It helps prevent low-quality posts like
 * placeholder content, spam, and poorly written descriptions.
 */

export interface ContentQualityResult {
  isValid: boolean;
  score: number; // 0-1 scale
  issues: string[];
  suggestions: string[];
  requiresModeration: boolean;
}

export interface QualityMetrics {
  placeholderScore: number;
  readabilityScore: number;
  specificityScore: number;
  professionalismScore: number;
}

/**
 * Detects placeholder or spam content patterns
 */
export function isPlaceholderContent(text: string): boolean {
  if (!text || text.length < 3) return false;
  
  const placeholderPatterns = [
    // Repeated characters or patterns
    /^(.)\1{3,}$/, // Same character repeated 4+ times
    /^[a-z]{3,}$/i, // Repeated letters like "asdasdasdasd"
    /^(.)\1{2,}(.)\2{2,}/i, // Alternating repeated characters
    
    // Common placeholder words
    /^(test|demo|placeholder|sample|example|temp|dummy|fake)/i,
    
    // Very repetitive patterns
    /^([a-z]+\s*){1,3}$/i, // Only 1-3 words repeated
    
    // Nonsense patterns
    /^[qwertyuiop]+$/i, // Keyboard mashing
    /^[asdfghjkl]+$/i, // Keyboard mashing
    /^[zxcvbnm]+$/i, // Keyboard mashing
    
    // Number patterns that look like placeholders
    /^(\d)\1{3,}$/, // Repeated numbers like "1111"
    /^123+$/, // Sequential numbers
  ];
  
  return placeholderPatterns.some(pattern => pattern.test(text.trim()));
}

/**
 * Calculates readability score using basic metrics
 */
export function calculateReadabilityScore(text: string): number {
  if (!text || text.length < 10) return 0;
  
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const syllables = countSyllables(text);
  
  if (words.length === 0 || sentences.length === 0) return 0;
  
  // Calculate Flesch Reading Ease (simplified)
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  // Simplified Flesch score (0-100, higher is easier to read)
  const fleschScore = Math.max(0, Math.min(100, 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)));
  
  // Normalize to 0-1 scale
  return Math.max(0, Math.min(1, fleschScore / 100));
}

/**
 * Counts syllables in text (simplified algorithm)
 */
function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let syllableCount = 0;
  
  for (const word of words) {
    if (word.length <= 3) {
      syllableCount += 1;
    } else {
      // Simplified syllable counting
      const vowels = word.match(/[aeiouy]+/g);
      syllableCount += vowels ? vowels.length : 1;
    }
  }
  
  return syllableCount;
}

/**
 * Assesses content specificity and detail level
 */
export function calculateSpecificityScore(title: string, description: string): number {
  let score = 0;
  
  // Title specificity
  const titleWords = title.split(/\s+/).filter(word => word.length > 2);
  const titleLength = title.length;
  
  if (titleLength >= 20 && titleLength <= 80) score += 0.3;
  if (titleWords.length >= 4) score += 0.2;
  if (!/^(need|want|looking|help|service|task)/i.test(title)) score += 0.2;
  
  // Description specificity
  const descWords = description.split(/\s+/).filter(word => word.length > 0);
  const descLength = description.length;
  
  if (descLength >= 50) score += 0.2;
  if (descLength >= 100) score += 0.1;
  if (descWords.length >= 15) score += 0.1;
  if (description.includes('experience') || description.includes('professional') || description.includes('reliable')) score += 0.1;
  
  return Math.min(1, score);
}

/**
 * Assesses professionalism and tone
 */
export function calculateProfessionalismScore(title: string, description: string): number {
  let score = 0.5; // Start with neutral score
  
  const text = `${title} ${description}`.toLowerCase();
  
  // Positive indicators
  const professionalWords = [
    'professional', 'experienced', 'reliable', 'quality', 'skilled', 'certified',
    'licensed', 'expert', 'specialist', 'qualified', 'trustworthy', 'efficient'
  ];
  
  const positiveCount = professionalWords.filter(word => text.includes(word)).length;
  score += Math.min(0.3, positiveCount * 0.05);
  
  // Negative indicators
  const unprofessionalWords = [
    'urgent', 'asap', 'quick', 'fast', 'cheap', 'budget', 'lowest', 'best price',
    'call now', 'text me', 'dm me', 'whatsapp', 'telegram'
  ];
  
  const negativeCount = unprofessionalWords.filter(word => text.includes(word)).length;
  score -= Math.min(0.2, negativeCount * 0.03);
  
  // Grammar and formatting
  if (description.includes('.') && description.includes(',')) score += 0.1;
  if (!/[A-Z]/.test(description)) score -= 0.1; // No capitalization
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Main function to assess content quality
 */
export function assessContentQuality(title: string, description: string): ContentQualityResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check for placeholder content
  if (isPlaceholderContent(title)) {
    issues.push("Title appears to be placeholder content");
    suggestions.push("Please provide a specific, descriptive title");
  }
  
  if (isPlaceholderContent(description)) {
    issues.push("Description appears to be placeholder content");
    suggestions.push("Please provide a detailed description of your needs or services");
  }
  
  // Calculate quality metrics
  const metrics: QualityMetrics = {
    placeholderScore: isPlaceholderContent(title) || isPlaceholderContent(description) ? 0 : 1,
    readabilityScore: calculateReadabilityScore(description),
    specificityScore: calculateSpecificityScore(title, description),
    professionalismScore: calculateProfessionalismScore(title, description),
  };
  
  // Calculate overall score
  const overallScore = (
    metrics.placeholderScore * 0.4 +
    metrics.readabilityScore * 0.2 +
    metrics.specificityScore * 0.25 +
    metrics.professionalismScore * 0.15
  );
  
  // Generate additional suggestions based on scores
  if (metrics.readabilityScore < 0.5) {
    suggestions.push("Consider breaking up long sentences for better readability");
  }
  
  if (metrics.specificityScore < 0.5) {
    suggestions.push("Add more specific details about requirements, timeline, or experience needed");
  }
  
  if (metrics.professionalismScore < 0.6) {
    suggestions.push("Consider using more professional language and avoiding urgent/desperate tone");
  }
  
  // Determine if moderation is required
  const requiresModeration = overallScore < 0.6 || issues.length > 2;
  
  return {
    isValid: overallScore >= 0.4 && issues.length <= 2,
    score: overallScore,
    issues,
    suggestions,
    requiresModeration,
  };
}

/**
 * Enhanced validation for form schema
 */
export function createEnhancedFormSchema() {
  return z.object({
    type: z.enum(["task", "service"], {
      required_error: "You need to select a post type.",
    }),
    title: z.string()
      .min(5, "Title must be at least 5 characters.")
      .max(100, "Title must be less than 100 characters.")
      .refine(
        (val) => !isPlaceholderContent(val),
        "Please provide a meaningful, specific title"
      ),
    category: z.enum([
      "Mason", "Carpenter", "Plumber", "Electrician", "Steel fabricator", "Tile setter",
      "Painter", "Gate installer", "Cabinet maker", "Modular cabinet installer",
      "Reupholstery worker", "Automotive mechanic", "Auto electrician", "Motorcycle technician",
      "Refrigeration and airconditioning technician", "Appliance repair technician",
      "Housekeeper", "Janitor", "Gardener", "Building maintenance technician",
      "Pest control worker", "Sewer line cleaner", "Sanitation worker", "In home chef service",
      "Cook", "Barista", "Bartender", "House cleaner", "Hairdresser", "Barber",
      "Nail technician", "Massage therapist", "Makeup artist", "Pet caretaker",
      "Pet groomer", "Tour guide", "Personal driver", "Forklift operator",
      "Delivery rider", "Warehouse personnel", "Truck driver", "Crane operator",
      "Aircon cleaner", "Aircon installer technician", "Field service Computer technician",
      "CCTv installer", "Scaffolder", "Rigger/signalman for heavy lifting",
      "Structural welder", "Tunnel boring machine operator", "Demolition specialist",
      "Watch repair technician", "Jeweler or stone setter", "Mold and die maker",
      "Precision tool grinder", "Orthotics/prosthetics technician", "Charter ship captain",
      "Charter pilot", "Marine electrician", "Marine diesel mechanic",
      "Lifeboat/rescue boat operator", "Able-bodied seaman", "Underwater welder",
      "Smart device installer", "Fiber optic technician", "Drone operator/pilot",
      "3D printing technician", "Solar panel installer and technician",
      "AV/lighting systems integrator", "Home visit physician", "Home care nurse",
      "Home service vet", "Medical laboratory technician", "X-ray technician",
      "Caregiver with NC II", "Chocolatier", "Artisan baker", "Wine/sake sommelier",
      "Brewing technician", "Business coach", "Language Tutor", "Music tutor",
      "PE instructor", "Sports coach/ PE trainer", "Personal health instructor",
      "Life skill trainer", "Corporate trainer", "Workshop facilitator",
      "Events coordinator", "Photographer /videographer", "Host/Emcee",
      "Floral arrangement specialist", "Event stylist / coordinator",
      "Lights and sound technician", "Hair and makeup artist",
      "Invitation and souvenir designer", "Venue coordinator",
      "Commercial/print ad model", "Fitness model", "Pageant coach",
      "Social media /influencer model", "Other"
    ]),
    description: z.string()
      .min(20, "Description must be at least 20 characters.")
      .max(500, "Description must be less than 500 characters.")
      .refine(
        (val) => !isPlaceholderContent(val),
        "Please provide a detailed, meaningful description"
      ),
    location: z.string().min(3, "Location is required."),
    pay: z.coerce.number().min(1, "Budget must be a positive number."),
  });
} 