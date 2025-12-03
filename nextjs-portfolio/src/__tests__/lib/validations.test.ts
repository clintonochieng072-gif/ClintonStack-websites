import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  updateOnboardingSchema,
  contactSchema,
  skillSchema,
  projectSchema,
  testimonialSchema,
  serviceSchema,
  galleryItemSchema,
  portfolioUpdateSchema,
} from '@/lib/validations';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid register input', () => {
      const validInput = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        displayName: 'Test User',
      };

      const result = registerSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should reject invalid username', () => {
      const invalidInput = {
        username: 'test user', // spaces not allowed
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = registerSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('username');
      }
    });

    it('should reject weak password', () => {
      const invalidInput = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password', // no uppercase or number
      };

      const result = registerSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login input', () => {
      const validInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidInput = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate valid email', () => {
      const validInput = {
        email: 'test@example.com',
      };

      const result = forgotPasswordSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate valid reset input', () => {
      const validInput = {
        token: 'valid-token',
        newPassword: 'NewPassword123',
      };

      const result = resetPasswordSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate valid profile update', () => {
      const validInput = {
        category: 'developer',
        niche: 'web',
        template: 'default',
        onboarded: true,
        avatarUrl: 'https://example.com/avatar.jpg',
        trialEndsAt: '2024-12-31T23:59:59.000Z',
      };

      const result = updateProfileSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('updateOnboardingSchema', () => {
    it('should validate valid onboarding update', () => {
      const validInput = {
        category: 'developer',
        niche: 'web',
        template: 'default',
      };

      const result = updateOnboardingSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('contactSchema', () => {
    it('should validate valid contact info', () => {
      const validInput = {
        email: 'test@example.com',
        phone: '+1234567890',
        website: 'https://example.com',
        linkedin: 'https://linkedin.com/in/test',
        github: 'https://github.com/test',
        twitter: 'https://twitter.com/test',
        instagram: 'https://instagram.com/test',
        facebook: 'https://facebook.com/test',
      };

      const result = contactSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('skillSchema', () => {
    it('should validate valid skill', () => {
      const result = skillSchema.safeParse('JavaScript');
      expect(result.success).toBe(true);
    });

    it('should reject empty skill', () => {
      const result = skillSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('projectSchema', () => {
    it('should validate valid project', () => {
      const validInput = {
        title: 'Test Project',
        description: 'A test project description',
        image: 'https://example.com/image.jpg',
        link: 'https://example.com',
        technologies: ['React', 'Node.js'],
      };

      const result = projectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('testimonialSchema', () => {
    it('should validate valid testimonial', () => {
      const validInput = {
        name: 'John Doe',
        message: 'Great work!',
        position: 'CEO',
        company: 'Example Inc',
        avatar: 'https://example.com/avatar.jpg',
      };

      const result = testimonialSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('serviceSchema', () => {
    it('should validate valid service', () => {
      const validInput = {
        title: 'Web Development',
        description: 'Building modern web applications',
        price: 1000,
        currency: 'USD',
      };

      const result = serviceSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('galleryItemSchema', () => {
    it('should validate valid gallery item', () => {
      const validInput = {
        url: 'https://example.com/image.jpg',
        alt: 'Test image',
        caption: 'A test image',
      };

      const result = galleryItemSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('portfolioUpdateSchema', () => {
    it('should validate valid portfolio update', () => {
      const validInput = {
        contacts: JSON.stringify({
          email: 'test@example.com',
        }),
        skills: JSON.stringify(['JavaScript', 'React']),
        projects: JSON.stringify([{
          title: 'Test Project',
          description: 'Test description',
        }]),
        testimonials: JSON.stringify([{
          name: 'John Doe',
          message: 'Great work!',
        }]),
        displayName: 'Test User',
        title: 'Software Developer',
        bio: 'A passionate developer',
        theme: 'light',
        isPublished: 'true',
        category: 'developer',
        niche: 'web',
        selectedTemplate: 'default',
        services: JSON.stringify([{
          title: 'Web Dev',
          description: 'Building websites',
        }]),
        gallery: JSON.stringify([{
          url: 'https://example.com/image.jpg',
        }]),
        themeColor: '#ffffff',
        heroImage: 'https://example.com/hero.jpg',
        sections: JSON.stringify({}),
        resumeUrl: 'https://example.com/resume.pdf',
      };

      const result = portfolioUpdateSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });
});