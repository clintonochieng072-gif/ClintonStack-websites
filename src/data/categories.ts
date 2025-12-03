export interface Category {
  id: string;
  name: string;
  niches: string[];
  templates: string[];
  modules: string[];
}

export const CATEGORY_GROUPS: Category[] = [
  {
    id: "home-repair-maintenance",
    name: "Home Repair & Maintenance",
    niches: ["plumber", "electrician", "carpenter", "painter", "handyman"],
    templates: ["services-template-1"],
    modules: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"]
  },
  {
    id: "construction-building",
    name: "Construction & Building",
    niches: ["mason", "welder", "roofer", "tiler"],
    templates: ["services-template-1"],
    modules: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"]
  },
  {
    id: "automotive-services",
    name: "Automotive Services",
    niches: ["mechanic", "car-detailer", "auto-electrician"],
    templates: ["services-template-1"],
    modules: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"]
  },
  {
    id: "creative-services",
    name: "Creative Services",
    niches: ["photographer", "videographer", "graphic-designer", "social-media-manager"],
    templates: ["creative-template-1"],
    modules: ["AboutModule", "GalleryModule", "ContactModule", "TestimonialsModule"]
  },
  {
    id: "freelance-online-work",
    name: "Freelance & Online Work",
    niches: ["web-developer", "copywriter", "virtual-assistant"],
    templates: ["freelancer-template-1"],
    modules: ["AboutModule", "SkillsModule", "ProjectsModule", "TestimonialsModule", "ContactModule"]
  },
  {
    id: "education-coaching",
    name: "Education & Coaching",
    niches: ["academic-tutor", "music-teacher", "language-teacher"],
    templates: ["freelancer-template-1"],
    modules: ["AboutModule", "ServicesModule", "SkillsModule", "TestimonialsModule", "ContactModule"]
  },
  {
    id: "beauty-personal-care",
    name: "Beauty & Personal Care",
    niches: ["barber", "hairstylist", "makeup-artist", "nail-technician"],
    templates: ["services-template-1"],
    modules: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"]
  },
  {
    id: "business-professional-services",
    name: "Business & Professional Services",
    niches: ["consultant", "marketer", "accountant"],
    templates: ["business-template-1", "consultant-template-1"],
    modules: ["AboutModule", "ServicesModule", "SkillsModule", "TestimonialsModule", "ContactModule"]
  },
  {
    id: "fashion-craft",
    name: "Fashion & Craft",
    niches: ["tailor", "shoemaker", "bag-maker"],
    templates: ["services-template-1"],
    modules: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"]
  },
  {
    id: "agriculture-food",
    name: "Agriculture & Food",
    niches: ["farmer", "poultry-keeper", "agriculture-specialist"],
    templates: ["services-template-1"],
    modules: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"]
  }
];

// Config map for modules based on niche
export const nicheModules: Record<string, string[]> = {
  plumber: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  electrician: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  carpenter: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  painter: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  handyman: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  mason: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  welder: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  roofer: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  tiler: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  mechanic: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  "car-detailer": ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  "auto-electrician": ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  photographer: ["AboutModule", "GalleryModule", "ContactModule", "TestimonialsModule"],
  videographer: ["AboutModule", "GalleryModule", "ContactModule", "TestimonialsModule"],
  "graphic-designer": ["AboutModule", "GalleryModule", "ContactModule", "TestimonialsModule"],
  "social-media-manager": ["AboutModule", "ServicesModule", "ContactModule", "TestimonialsModule"],
  "web-developer": ["AboutModule", "SkillsModule", "ProjectsModule", "TestimonialsModule", "ContactModule"],
  copywriter: ["AboutModule", "ServicesModule", "ProjectsModule", "TestimonialsModule", "ContactModule"],
  "virtual-assistant": ["AboutModule", "ServicesModule", "SkillsModule", "TestimonialsModule", "ContactModule"],
  "academic-tutor": ["AboutModule", "ServicesModule", "SkillsModule", "TestimonialsModule", "ContactModule"],
  "music-teacher": ["AboutModule", "ServicesModule", "SkillsModule", "TestimonialsModule", "ContactModule"],
  "language-teacher": ["AboutModule", "ServicesModule", "SkillsModule", "TestimonialsModule", "ContactModule"],
  barber: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  hairstylist: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  "makeup-artist": ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  "nail-technician": ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  consultant: ["AboutModule", "ServicesModule", "SkillsModule", "TestimonialsModule", "ContactModule"],
  marketer: ["AboutModule", "ServicesModule", "ProjectsModule", "TestimonialsModule", "ContactModule"],
  accountant: ["AboutModule", "ServicesModule", "SkillsModule", "TestimonialsModule", "ContactModule"],
  tailor: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  shoemaker: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  "bag-maker": ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  farmer: ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  "poultry-keeper": ["AboutModule", "ServicesModule", "GalleryModule", "TestimonialsModule", "ContactModule"],
  "agriculture-specialist": ["AboutModule", "ServicesModule", "SkillsModule", "TestimonialsModule", "ContactModule"]
};
