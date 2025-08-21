'use server';
/**
 * @fileOverview A flow to suggest details for a new task or service posting.
 *
 * - suggestDetails - A function that suggests a category and description.
 * - SuggestDetailsInput - The input type for the suggestDetails function.
 * - SuggestDetailsOutput - The return type for the suggestDetails function.
 */

import {z} from 'genkit';
import { TaskCategoryEnum } from '@/types';

const SuggestDetailsInputSchema = z.object({
  userInput: z.string().describe('The user-provided title for the task or service.'),
  postType: z.enum(['task', 'service']).optional().describe('The type of post, whether a task the user needs done or a service they are offering.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The history of the conversation between the user and the AI.'),
});
export type SuggestDetailsInput = z.infer<typeof SuggestDetailsInputSchema>;

const SuggestDetailsOutputSchema = z.object({
  category: TaskCategoryEnum.describe('The suggested category for the post.'),
  description: z.string().optional().describe('A well-written, detailed description for the task or service based on the title and conversation history.'),
  question: z.string().optional().describe('A follow-up question to ask the user for more details, if needed.'),
  status: z.enum(['asking', 'complete']).describe('The status of the conversation: asking a follow-up question or complete.'),
});
export type SuggestDetailsOutput = z.infer<typeof SuggestDetailsOutputSchema>;

export async function suggestDetails(input: SuggestDetailsInput): Promise<SuggestDetailsOutput> {
  return suggestDetailsFlow(input);
}

// Comprehensive rule-based category detection
function detectCategory(title: string, postType?: string): string {
  const lowerTitle = title.toLowerCase();
  
  // 🔧 Construction & Carpentry
  if (lowerTitle.includes('mason') || lowerTitle.includes('brick') || lowerTitle.includes('stone')) {
    return 'Mason';
  }
  if (lowerTitle.includes('carpenter') || lowerTitle.includes('woodwork') || lowerTitle.includes('carpentry')) {
    return 'Carpenter';
  }
  if (lowerTitle.includes('plumb') || lowerTitle.includes('pipe') || lowerTitle.includes('water')) {
    return 'Plumber';
  }
  if (lowerTitle.includes('electric') || lowerTitle.includes('wiring') || lowerTitle.includes('electrical')) {
    return 'Electrician';
  }
  if (lowerTitle.includes('steel') || lowerTitle.includes('metal') || lowerTitle.includes('fabricat')) {
    return 'Steel fabricator';
  }
  if (lowerTitle.includes('tile') || lowerTitle.includes('ceramic') || lowerTitle.includes('flooring')) {
    return 'Tile setter';
  }
  if (lowerTitle.includes('paint') || lowerTitle.includes('painting')) {
    return 'Painter';
  }
  if (lowerTitle.includes('gate') || lowerTitle.includes('fence')) {
    return 'Gate installer';
  }
  if (lowerTitle.includes('cabinet') || lowerTitle.includes('kitchen')) {
    return 'Cabinet maker';
  }
  if (lowerTitle.includes('modular')) {
    return 'Modular cabinet installer';
  }
  if (lowerTitle.includes('reupholstery') || lowerTitle.includes('upholstery') || lowerTitle.includes('furniture')) {
    return 'Reupholstery worker';
  }
  
  // 🧰 Mechanical & Electrical
  if (lowerTitle.includes('automotive') || lowerTitle.includes('car') || lowerTitle.includes('vehicle')) {
    return 'Automotive mechanic';
  }
  if (lowerTitle.includes('auto electric') || lowerTitle.includes('car electric')) {
    return 'Auto electrician';
  }
  if (lowerTitle.includes('motorcycle') || lowerTitle.includes('bike')) {
    return 'Motorcycle technician';
  }
  if (lowerTitle.includes('refrigeration') || lowerTitle.includes('aircon') || lowerTitle.includes('ac')) {
    return 'Refrigeration and airconditioning technician';
  }
  if (lowerTitle.includes('appliance') || lowerTitle.includes('repair')) {
    return 'Appliance repair technician';
  }
  
  // 🧼 Services & Maintenance
  if (lowerTitle.includes('housekeep') || lowerTitle.includes('house clean')) {
    return 'Housekeeper';
  }
  if (lowerTitle.includes('janitor') || lowerTitle.includes('cleaning')) {
    return 'Janitor';
  }
  if (lowerTitle.includes('garden') || lowerTitle.includes('landscape')) {
    return 'Gardener';
  }
  if (lowerTitle.includes('maintenance') || lowerTitle.includes('building')) {
    return 'Building maintenance technician';
  }
  if (lowerTitle.includes('pest') || lowerTitle.includes('exterminat')) {
    return 'Pest control worker';
  }
  if (lowerTitle.includes('sewer') || lowerTitle.includes('drain')) {
    return 'Sewer line cleaner';
  }
  if (lowerTitle.includes('sanitation') || lowerTitle.includes('garbage')) {
    return 'Sanitation worker';
  }
  
  // 🧑‍🍳 Hospitality & Culinary
  if (lowerTitle.includes('chef') || lowerTitle.includes('cooking') || lowerTitle.includes('cook')) {
    return 'Cook';
  }
  if (lowerTitle.includes('barista') || lowerTitle.includes('coffee')) {
    return 'Barista';
  }
  if (lowerTitle.includes('bartender') || lowerTitle.includes('bar')) {
    return 'Bartender';
  }
  if (lowerTitle.includes('house clean')) {
    return 'House cleaner';
  }
  
  // 💅 Beauty & Wellness
  if (lowerTitle.includes('hair') || lowerTitle.includes('haircut')) {
    return 'Hairdresser';
  }
  if (lowerTitle.includes('barber') || lowerTitle.includes('beard')) {
    return 'Barber';
  }
  if (lowerTitle.includes('nail') || lowerTitle.includes('manicure')) {
    return 'Nail technician';
  }
  if (lowerTitle.includes('massage') || lowerTitle.includes('therapy')) {
    return 'Massage therapist';
  }
  if (lowerTitle.includes('makeup') || lowerTitle.includes('cosmetic')) {
    return 'Makeup artist';
  }
  if (lowerTitle.includes('pet') || lowerTitle.includes('dog') || lowerTitle.includes('cat')) {
    return 'Pet caretaker';
  }
  if (lowerTitle.includes('groom') || lowerTitle.includes('pet groom')) {
    return 'Pet groomer';
  }
  if (lowerTitle.includes('tour') || lowerTitle.includes('guide')) {
    return 'Tour guide';
  }
  
  // 📦 Logistics & Transport
  if (lowerTitle.includes('driver') || lowerTitle.includes('drive')) {
    return 'Personal driver';
  }
  if (lowerTitle.includes('forklift') || lowerTitle.includes('warehouse')) {
    return 'Forklift operator';
  }
  if (lowerTitle.includes('delivery') || lowerTitle.includes('deliver')) {
    return 'Delivery rider';
  }
  if (lowerTitle.includes('warehouse') || lowerTitle.includes('storage')) {
    return 'Warehouse personnel';
  }
  if (lowerTitle.includes('truck') || lowerTitle.includes('haul')) {
    return 'Truck driver';
  }
  if (lowerTitle.includes('crane') || lowerTitle.includes('lift')) {
    return 'Crane operator';
  }
  
  // ⚙️ Technical and Industrial
  if (lowerTitle.includes('aircon clean')) {
    return 'Aircon cleaner';
  }
  if (lowerTitle.includes('aircon install')) {
    return 'Aircon installer technician';
  }
  if (lowerTitle.includes('computer') || lowerTitle.includes('pc') || lowerTitle.includes('laptop')) {
    return 'Field service Computer technician';
  }
  if (lowerTitle.includes('cctv') || lowerTitle.includes('camera') || lowerTitle.includes('security')) {
    return 'CCTv installer';
  }
  
  // 🏗️ High-risk Construction
  if (lowerTitle.includes('scaffold')) {
    return 'Scaffolder';
  }
  if (lowerTitle.includes('rigger') || lowerTitle.includes('signalman')) {
    return 'Rigger/signalman for heavy lifting';
  }
  if (lowerTitle.includes('welder') || lowerTitle.includes('weld')) {
    return 'Structural welder';
  }
  if (lowerTitle.includes('tunnel') || lowerTitle.includes('boring')) {
    return 'Tunnel boring machine operator';
  }
  if (lowerTitle.includes('demolition') || lowerTitle.includes('demolish')) {
    return 'Demolition specialist';
  }
  
  // 🛠️ Precision Trades
  if (lowerTitle.includes('watch') || lowerTitle.includes('clock')) {
    return 'Watch repair technician';
  }
  if (lowerTitle.includes('jewel') || lowerTitle.includes('stone')) {
    return 'Jeweler or stone setter';
  }
  if (lowerTitle.includes('mold') || lowerTitle.includes('die')) {
    return 'Mold and die maker';
  }
  if (lowerTitle.includes('tool grind') || lowerTitle.includes('precision')) {
    return 'Precision tool grinder';
  }
  if (lowerTitle.includes('orthotic') || lowerTitle.includes('prosthetic')) {
    return 'Orthotics/prosthetics technician';
  }
  
  // 🚢 Maritime
  if (lowerTitle.includes('captain') || lowerTitle.includes('ship')) {
    return 'Charter ship captain';
  }
  if (lowerTitle.includes('pilot') || lowerTitle.includes('aviation')) {
    return 'Charter pilot';
  }
  if (lowerTitle.includes('marine electric')) {
    return 'Marine electrician';
  }
  if (lowerTitle.includes('marine diesel')) {
    return 'Marine diesel mechanic';
  }
  if (lowerTitle.includes('lifeboat') || lowerTitle.includes('rescue')) {
    return 'Lifeboat/rescue boat operator';
  }
  if (lowerTitle.includes('seaman') || lowerTitle.includes('sailor')) {
    return 'Able-bodied seaman';
  }
  if (lowerTitle.includes('underwater') || lowerTitle.includes('diving')) {
    return 'Underwater welder';
  }
  
  // 🖥️ Tech-Related
  if (lowerTitle.includes('smart device') || lowerTitle.includes('smartphone')) {
    return 'Smart device installer';
  }
  if (lowerTitle.includes('fiber optic') || lowerTitle.includes('fiber')) {
    return 'Fiber optic technician';
  }
  if (lowerTitle.includes('drone') || lowerTitle.includes('uav')) {
    return 'Drone operator/pilot';
  }
  if (lowerTitle.includes('3d print') || lowerTitle.includes('additive')) {
    return '3D printing technician';
  }
  if (lowerTitle.includes('solar') || lowerTitle.includes('panel')) {
    return 'Solar panel installer and technician';
  }
  if (lowerTitle.includes('av') || lowerTitle.includes('lighting') || lowerTitle.includes('sound')) {
    return 'AV/lighting systems integrator';
  }
  
  // 🧑‍⚕️ Healthcare Support
  if (lowerTitle.includes('physician') || lowerTitle.includes('doctor')) {
    return 'Home visit physician';
  }
  if (lowerTitle.includes('nurse') || lowerTitle.includes('nursing')) {
    return 'Home care nurse';
  }
  if (lowerTitle.includes('vet') || lowerTitle.includes('veterinary')) {
    return 'Home service vet';
  }
  if (lowerTitle.includes('laboratory') || lowerTitle.includes('lab')) {
    return 'Medical laboratory technician';
  }
  if (lowerTitle.includes('x-ray') || lowerTitle.includes('xray')) {
    return 'X-ray technician';
  }
  if (lowerTitle.includes('caregiver') || lowerTitle.includes('nc ii')) {
    return 'Caregiver with NC II';
  }
  
  // 🏥 Medical & Wellness Home Services
  if (lowerTitle.includes('home service vet') || lowerTitle.includes('pet vaccination') || lowerTitle.includes('pet checkup')) {
    return 'Home Service Vet';
  }
  if (lowerTitle.includes('home service physician') || lowerTitle.includes('home doctor') || lowerTitle.includes('house call doctor')) {
    return 'Home Service Physician';
  }
  if (lowerTitle.includes('nurse at home') || lowerTitle.includes('home nursing') || lowerTitle.includes('wound care') || lowerTitle.includes('iv drip')) {
    return 'Nurse at Home';
  }
  if (lowerTitle.includes('physical therapist') || lowerTitle.includes('physiotherapy') || lowerTitle.includes('home therapy')) {
    return 'Physical Therapist';
  }
  if (lowerTitle.includes('midwife') || lowerTitle.includes('home birth') || lowerTitle.includes('birth assistant')) {
    return 'Midwife / Home Birth Assistant';
  }
  if (lowerTitle.includes('mobile laboratory') || lowerTitle.includes('diagnostic services') || lowerTitle.includes('blood test') || lowerTitle.includes('ecg')) {
    return 'Mobile Laboratory / Diagnostic Services';
  }
  if (lowerTitle.includes('vaccination at home') || lowerTitle.includes('home vaccination') || lowerTitle.includes('flu shot') || lowerTitle.includes('covid vaccine')) {
    return 'Vaccination at Home';
  }
  
  // 🧪 Food & Beverage (Specialty)
  if (lowerTitle.includes('chocolatier') || lowerTitle.includes('chocolate')) {
    return 'Chocolatier';
  }
  if (lowerTitle.includes('baker') || lowerTitle.includes('bread') || lowerTitle.includes('pastry')) {
    return 'Artisan baker';
  }
  if (lowerTitle.includes('sommelier') || lowerTitle.includes('wine')) {
    return 'Wine/sake sommelier';
  }
  if (lowerTitle.includes('brew') || lowerTitle.includes('beer')) {
    return 'Brewing technician';
  }
  
  // 📚 Education and Training
  if (lowerTitle.includes('business coach') || lowerTitle.includes('coach')) {
    return 'Business coach';
  }
  if (lowerTitle.includes('language') || lowerTitle.includes('tutor')) {
    return 'Language Tutor';
  }
  if (lowerTitle.includes('music') || lowerTitle.includes('instrument')) {
    return 'Music tutor';
  }
  if (lowerTitle.includes('pe') || lowerTitle.includes('physical education')) {
    return 'PE instructor';
  }
  if (lowerTitle.includes('sports') || lowerTitle.includes('athletic')) {
    return 'Sports coach/ PE trainer';
  }
  if (lowerTitle.includes('health') || lowerTitle.includes('fitness')) {
    return 'Personal health instructor';
  }
  if (lowerTitle.includes('life skill')) {
    return 'Life skill trainer';
  }
  if (lowerTitle.includes('corporate') || lowerTitle.includes('training')) {
    return 'Corporate trainer';
  }
  if (lowerTitle.includes('workshop') || lowerTitle.includes('facilitator')) {
    return 'Workshop facilitator';
  }
  
  // 🎉 Events Planning and Hospitality
  if (lowerTitle.includes('event') || lowerTitle.includes('coordinator')) {
    return 'Events coordinator';
  }
  if (lowerTitle.includes('photograph') || lowerTitle.includes('videograph') || lowerTitle.includes('camera')) {
    return 'Photographer /videographer';
  }
  if (lowerTitle.includes('host') || lowerTitle.includes('emcee') || lowerTitle.includes('mc')) {
    return 'Host/Emcee';
  }
  if (lowerTitle.includes('floral') || lowerTitle.includes('flower')) {
    return 'Floral arrangement specialist';
  }
  if (lowerTitle.includes('stylist') || lowerTitle.includes('coordinator')) {
    return 'Event stylist / coordinator';
  }
  if (lowerTitle.includes('light') || lowerTitle.includes('sound')) {
    return 'Lights and sound technician';
  }
  if (lowerTitle.includes('hair and makeup') || lowerTitle.includes('makeup artist')) {
    return 'Hair and makeup artist';
  }
  if (lowerTitle.includes('invitation') || lowerTitle.includes('souvenir')) {
    return 'Invitation and souvenir designer';
  }
  if (lowerTitle.includes('venue') || lowerTitle.includes('location')) {
    return 'Venue coordinator';
  }
  
  // 🎨 Creative Arts, Media and Entertainment Services
  if (lowerTitle.includes('model') || lowerTitle.includes('modeling')) {
    return 'Commercial/print ad model';
  }
  if (lowerTitle.includes('fitness model')) {
    return 'Fitness model';
  }
  if (lowerTitle.includes('pageant') || lowerTitle.includes('beauty')) {
    return 'Pageant coach';
  }
  if (lowerTitle.includes('influencer') || lowerTitle.includes('social media')) {
    return 'Social media /influencer model';
  }
  
  // Legacy categories (fallback)
  if (lowerTitle.includes('clean') || lowerTitle.includes('repair') || lowerTitle.includes('fix') || 
      lowerTitle.includes('install') || lowerTitle.includes('maintenance') || lowerTitle.includes('plumbing') ||
      lowerTitle.includes('electrical') || lowerTitle.includes('carpentry') || lowerTitle.includes('painting')) {
    return 'Home Services';
  }
  
  if (lowerTitle.includes('deliver') || lowerTitle.includes('pickup') || lowerTitle.includes('transport') ||
      lowerTitle.includes('move') || lowerTitle.includes('shipping') || lowerTitle.includes('courier')) {
    return 'Delivery';
  }
  
  if (lowerTitle.includes('teach') || lowerTitle.includes('tutor') || lowerTitle.includes('lesson') ||
      lowerTitle.includes('study') || lowerTitle.includes('homework') || lowerTitle.includes('academic') ||
      lowerTitle.includes('math') || lowerTitle.includes('english') || lowerTitle.includes('science')) {
    return 'Tutoring';
  }
  
  if (lowerTitle.includes('event') || lowerTitle.includes('party') || lowerTitle.includes('celebration') ||
      lowerTitle.includes('catering') || lowerTitle.includes('photography') || lowerTitle.includes('music') ||
      lowerTitle.includes('decoration') || lowerTitle.includes('planning')) {
    return 'Events';
  }
  
  // Default to Other
  return 'Other';
}

// Generate description based on title and category
function generateDescription(title: string, category: string, postType?: string): string {
  const isTask = postType === 'task';
  const isService = postType === 'service';
  
  const baseDescriptions = {
    // 🔧 Construction & Carpentry
    'Mason': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled mason with experience in brickwork, stonework, and masonry projects.`,
      service: `I offer professional masonry services including brickwork, stonework, and construction. Experienced, reliable, and committed to quality craftsmanship.`
    },
    'Carpenter': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled carpenter with experience in woodwork and carpentry projects.`,
      service: `I offer professional carpentry services including custom woodwork, furniture making, and home improvements. Experienced, reliable, and committed to quality work.`
    },
    'Plumber': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed plumber with experience in plumbing repairs and installations.`,
      service: `I offer professional plumbing services including repairs, installations, and emergency services. Licensed, experienced, and committed to quality work.`
    },
    'Electrician': {
      task: `I need help with ${title.toLowerCase()}. Looking for a certified electrician with experience in electrical work and safety.`,
      service: `I offer professional electrical services including installations, repairs, and safety inspections. Certified, experienced, and committed to quality work.`
    },
    'Steel fabricator': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled steel fabricator with experience in metalwork and fabrication.`,
      service: `I offer professional steel fabrication services including custom metalwork and structural fabrication. Experienced, reliable, and committed to quality work.`
    },
    'Tile setter': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled tile setter with experience in ceramic and flooring installations.`,
      service: `I offer professional tile setting services including ceramic, porcelain, and natural stone installations. Experienced, reliable, and committed to quality work.`
    },
    'Painter': {
      task: `I need help with ${title.toLowerCase()}. Looking for a professional painter with experience in interior and exterior painting.`,
      service: `I offer professional painting services including interior, exterior, and decorative finishes. Experienced, reliable, and committed to quality work.`
    },
    'Gate installer': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled gate installer with experience in security and decorative gates.`,
      service: `I offer professional gate installation services including security gates, decorative gates, and automated systems. Experienced, reliable, and committed to quality work.`
    },
    'Cabinet maker': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled cabinet maker with experience in custom woodwork and cabinetry.`,
      service: `I offer professional cabinet making services including custom kitchens, bathrooms, and furniture. Experienced, reliable, and committed to quality craftsmanship.`
    },
    'Modular cabinet installer': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled modular cabinet installer with experience in modern cabinetry systems.`,
      service: `I offer professional modular cabinet installation services including modern kitchen and bathroom systems. Experienced, reliable, and committed to quality work.`
    },
    'Reupholstery worker': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled reupholstery worker with experience in furniture restoration.`,
      service: `I offer professional reupholstery services including furniture restoration and custom upholstery work. Experienced, reliable, and committed to quality craftsmanship.`
    },
    
    // 🧰 Mechanical & Electrical
    'Automotive mechanic': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled automotive mechanic with experience in vehicle repairs and maintenance.`,
      service: `I offer professional automotive repair services including diagnostics, repairs, and maintenance. Experienced, reliable, and committed to quality work.`
    },
    'Auto electrician': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled auto electrician with experience in vehicle electrical systems.`,
      service: `I offer professional auto electrical services including diagnostics, repairs, and installations. Experienced, reliable, and committed to quality work.`
    },
    'Motorcycle technician': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled motorcycle technician with experience in bike repairs and maintenance.`,
      service: `I offer professional motorcycle repair services including diagnostics, repairs, and maintenance. Experienced, reliable, and committed to quality work.`
    },
    'Refrigeration and airconditioning technician': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled HVAC technician with experience in refrigeration and air conditioning systems.`,
      service: `I offer professional HVAC services including installation, repair, and maintenance of refrigeration and air conditioning systems. Experienced, reliable, and committed to quality work.`
    },
    'Appliance repair technician': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled appliance repair technician with experience in household appliance repairs.`,
      service: `I offer professional appliance repair services including diagnostics, repairs, and maintenance of household appliances. Experienced, reliable, and committed to quality work.`
    },
    
    // 🧼 Services & Maintenance
    'Housekeeper': {
      task: `I need help with ${title.toLowerCase()}. Looking for a reliable housekeeper with experience in residential cleaning and maintenance.`,
      service: `I offer professional housekeeping services including regular cleaning, deep cleaning, and home maintenance. Reliable, thorough, and committed to quality service.`
    },
    'Janitor': {
      task: `I need help with ${title.toLowerCase()}. Looking for a reliable janitor with experience in commercial cleaning and maintenance.`,
      service: `I offer professional janitorial services including commercial cleaning, maintenance, and facility management. Reliable, thorough, and committed to quality service.`
    },
    'Gardener': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled gardener with experience in landscape design and maintenance.`,
      service: `I offer professional gardening services including landscape design, maintenance, and plant care. Experienced, reliable, and committed to quality work.`
    },
    'Building maintenance technician': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled building maintenance technician with experience in facility management.`,
      service: `I offer professional building maintenance services including repairs, inspections, and facility management. Experienced, reliable, and committed to quality work.`
    },
    'Pest control worker': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed pest control worker with experience in pest management and extermination.`,
      service: `I offer professional pest control services including inspection, treatment, and prevention. Licensed, experienced, and committed to effective pest management.`
    },
    'Sewer line cleaner': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled sewer line cleaner with experience in drain cleaning and maintenance.`,
      service: `I offer professional sewer line cleaning services including drain cleaning, maintenance, and emergency services. Experienced, reliable, and committed to quality work.`
    },
    'Sanitation worker': {
      task: `I need help with ${title.toLowerCase()}. Looking for a reliable sanitation worker with experience in waste management and cleaning.`,
      service: `I offer professional sanitation services including waste management, cleaning, and environmental services. Reliable, thorough, and committed to quality service.`
    },
    
    // 🧑‍🍳 Hospitality & Culinary
    'In home chef service': {
      task: `I need help with ${title.toLowerCase()}. Looking for a professional chef with experience in home cooking and meal preparation.`,
      service: `I offer professional in-home chef services including meal preparation, cooking classes, and catering. Experienced, reliable, and committed to quality culinary service.`
    },
    'Cook': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled cook with experience in food preparation and cooking.`,
      service: `I offer professional cooking services including meal preparation, catering, and culinary assistance. Experienced, reliable, and committed to quality culinary service.`
    },
    'Barista': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled barista with experience in coffee preparation and service.`,
      service: `I offer professional barista services including coffee preparation, latte art, and beverage service. Experienced, reliable, and committed to quality service.`
    },
    'Bartender': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled bartender with experience in beverage preparation and service.`,
      service: `I offer professional bartending services including cocktail preparation, beverage service, and event bartending. Experienced, reliable, and committed to quality service.`
    },
    'House cleaner': {
      task: `I need help with ${title.toLowerCase()}. Looking for a reliable house cleaner with experience in residential cleaning.`,
      service: `I offer professional house cleaning services including regular cleaning, deep cleaning, and specialized cleaning. Reliable, thorough, and committed to quality service.`
    },
    
    // 💅 Beauty & Wellness
    'Hairdresser': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled hairdresser with experience in hair styling and treatments.`,
      service: `I offer professional hairdressing services including cutting, styling, coloring, and treatments. Experienced, reliable, and committed to quality service.`
    },
    'Barber': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled barber with experience in men's grooming and styling.`,
      service: `I offer professional barbering services including cutting, styling, and grooming for men. Experienced, reliable, and committed to quality service.`
    },
    'Nail technician': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled nail technician with experience in nail care and treatments.`,
      service: `I offer professional nail services including manicures, pedicures, and nail art. Experienced, reliable, and committed to quality service.`
    },
    'Massage therapist': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed massage therapist with experience in therapeutic massage.`,
      service: `I offer professional massage therapy services including therapeutic, relaxation, and specialized massage techniques. Licensed, experienced, and committed to quality service.`
    },
    'Makeup artist': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled makeup artist with experience in beauty and special event makeup.`,
      service: `I offer professional makeup services including beauty makeup, special event makeup, and bridal makeup. Experienced, reliable, and committed to quality service.`
    },
    'Pet caretaker': {
      task: `I need help with ${title.toLowerCase()}. Looking for a reliable pet caretaker with experience in animal care and pet sitting.`,
      service: `I offer professional pet care services including pet sitting, walking, and animal care. Reliable, experienced, and committed to quality pet care.`
    },
    'Pet groomer': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled pet groomer with experience in animal grooming and care.`,
      service: `I offer professional pet grooming services including bathing, cutting, and styling for pets. Experienced, reliable, and committed to quality pet care.`
    },
    'Tour guide': {
      task: `I need help with ${title.toLowerCase()}. Looking for a knowledgeable tour guide with experience in local attractions and history.`,
      service: `I offer professional tour guide services including guided tours, local knowledge, and cultural experiences. Experienced, knowledgeable, and committed to quality service.`
    },
    
    // 📦 Logistics & Transport
    'Personal driver': {
      task: `I need help with ${title.toLowerCase()}. Looking for a reliable personal driver with experience in safe and professional driving.`,
      service: `I offer professional personal driving services including chauffeuring, transportation, and safe driving. Experienced, reliable, and committed to quality service.`
    },
    'Forklift operator': {
      task: `I need help with ${title.toLowerCase()}. Looking for a certified forklift operator with experience in warehouse operations.`,
      service: `I offer professional forklift operation services including warehouse operations, material handling, and logistics support. Certified, experienced, and committed to quality work.`
    },
    'Delivery rider': {
      task: `I need help with ${title.toLowerCase()}. Looking for a reliable delivery rider with experience in fast and safe delivery services.`,
      service: `I offer professional delivery services including fast, safe, and reliable delivery of packages and items. Experienced, reliable, and committed to quality service.`
    },
    'Warehouse personnel': {
      task: `I need help with ${title.toLowerCase()}. Looking for a skilled warehouse worker with experience in inventory management and logistics.`,
      service: `I offer professional warehouse services including inventory management, order fulfillment, and logistics support. Experienced, reliable, and committed to quality work.`
    },
    'Truck driver': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed truck driver with experience in commercial transportation.`,
      service: `I offer professional truck driving services including commercial transportation, hauling, and logistics. Licensed, experienced, and committed to quality service.`
    },
    'Crane operator': {
      task: `I need help with ${title.toLowerCase()}. Looking for a certified crane operator with experience in heavy lifting operations.`,
      service: `I offer professional crane operation services including heavy lifting, construction support, and industrial operations. Certified, experienced, and committed to quality work.`
    },
    
    // 🧑‍⚕️ Healthcare Support
    'Home visit physician': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed physician with experience in home healthcare services.`,
      service: `I offer professional home visit physician services including general check-ups, follow-up visits, and medical consultations. Licensed, experienced, and committed to quality healthcare.`
    },
    'Home care nurse': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed nurse with experience in home healthcare and patient care.`,
      service: `I offer professional home care nursing services including wound care, medication management, and patient monitoring. Licensed, experienced, and committed to quality healthcare.`
    },
    'Home service vet': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed veterinarian with experience in home pet care services.`,
      service: `I offer professional home veterinary services including pet check-ups, vaccinations, and minor treatments. Licensed, experienced, and committed to quality pet care.`
    },
    'Medical laboratory technician': {
      task: `I need help with ${title.toLowerCase()}. Looking for a certified medical laboratory technician with experience in diagnostic testing.`,
      service: `I offer professional medical laboratory services including diagnostic testing and sample analysis. Certified, experienced, and committed to quality healthcare.`
    },
    'X-ray technician': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed X-ray technician with experience in medical imaging.`,
      service: `I offer professional X-ray and medical imaging services including diagnostic imaging and safety protocols. Licensed, experienced, and committed to quality healthcare.`
    },
    'Caregiver with NC II': {
      task: `I need help with ${title.toLowerCase()}. Looking for a certified caregiver with NC II qualification and experience in patient care.`,
      service: `I offer professional caregiving services including patient care, assistance, and support. NC II certified, experienced, and committed to quality care.`
    },
    
    // 🏥 Medical & Wellness Home Services
    'Home Service Vet': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed veterinarian with experience in home pet care including vaccinations, check-ups, and minor treatments.`,
      service: `I offer professional home veterinary services including pet vaccinations, health check-ups, and minor treatments. Licensed, experienced, and committed to quality pet care in the comfort of your home.`
    },
    'Home Service Physician': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed physician with experience in home medical services including general check-ups and follow-up visits.`,
      service: `I offer professional home physician services including general check-ups, follow-up visits, and medical consultations. Licensed, experienced, and committed to quality healthcare in the comfort of your home.`
    },
    'Nurse at Home': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed nurse with experience in home healthcare including wound care, injections, IV drip, and BP monitoring.`,
      service: `I offer professional home nursing services including wound care, injections, IV drip administration, and blood pressure monitoring. Licensed, experienced, and committed to quality healthcare in the comfort of your home.`
    },
    'Physical Therapist': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed physical therapist with experience in home therapy sessions and rehabilitation.`,
      service: `I offer professional home physical therapy services including rehabilitation sessions, therapeutic exercises, and mobility training. Licensed, experienced, and committed to quality therapy in the comfort of your home.`
    },
    'Midwife / Home Birth Assistant': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed midwife with experience in home birth assistance and maternal care.`,
      service: `I offer professional midwifery services including home birth assistance, maternal care, and childbirth support. Licensed, experienced, and committed to quality maternal care in the comfort of your home.`
    },
    'Mobile Laboratory / Diagnostic Services': {
      task: `I need help with ${title.toLowerCase()}. Looking for a certified laboratory technician with experience in mobile diagnostic services including blood tests and ECG.`,
      service: `I offer professional mobile laboratory services including blood tests, ECG, and other diagnostic procedures. Certified, experienced, and committed to quality diagnostic services in the comfort of your home.`
    },
    'Vaccination at Home': {
      task: `I need help with ${title.toLowerCase()}. Looking for a licensed healthcare professional with experience in home vaccination services including flu and COVID vaccines.`,
      service: `I offer professional home vaccination services including flu shots, COVID vaccines, and other immunization services. Licensed, experienced, and committed to quality vaccination services in the comfort of your home.`
    },
    
    // Legacy categories (keeping for backward compatibility)
    'Home Services': {
      task: `I need help with ${title.toLowerCase()}. Looking for a reliable and skilled professional who can complete this work efficiently and with attention to detail.`,
      service: `I offer professional ${title.toLowerCase()} services. Experienced, reliable, and committed to quality work. Available for both residential and commercial projects.`
    },
    'Delivery': {
      task: `I need assistance with ${title.toLowerCase()}. Looking for someone trustworthy and punctual to help with this delivery.`,
      service: `I provide reliable ${title.toLowerCase()} services. Safe, timely, and professional delivery with proper handling of items.`
    },
    'Tutoring': {
      task: `I need help with ${title.toLowerCase()}. Looking for a patient and knowledgeable tutor who can explain concepts clearly.`,
      service: `I offer ${title.toLowerCase()} tutoring services. Experienced educator with a passion for helping students succeed.`
    },
    'Events': {
      task: `I need assistance with ${title.toLowerCase()}. Looking for someone creative and organized to help make this event special.`,
      service: `I provide ${title.toLowerCase()} services for events. Creative, professional, and dedicated to making your event memorable.`
    },
    'Other': {
      task: `I need help with ${title.toLowerCase()}. Looking for someone reliable and skilled to assist with this task.`,
      service: `I offer ${title.toLowerCase()} services. Professional, reliable, and committed to delivering quality results.`
    }
  };
  
  return baseDescriptions[category as keyof typeof baseDescriptions]?.[isTask ? 'task' : 'service'] || 
         baseDescriptions['Other'][isTask ? 'task' : 'service'];
}

const suggestDetailsFlow = async (input: SuggestDetailsInput): Promise<SuggestDetailsOutput> => {
  const { userInput, postType } = input;
  
  // Detect category based on title
  const category = detectCategory(userInput, postType);
  
  // Generate description
  const description = generateDescription(userInput, category, postType);
  
  return {
    category: category as any,
    description,
    status: 'complete'
  };
};
