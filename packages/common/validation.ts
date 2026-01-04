import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email("Noto'g'ri email formati"),
    password: z.string().min(1, "Parol kiritish shart"),
});

export const registerSchema = z.object({
    full_name: z.string().min(3, "Ism kamida 3 ta harfdan iborat bo'lishi kerak"),
    email: z.string().email("Noto'g'ri email formati"),
    password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

export const profileSchema = z.object({
    full_name: z.string().min(3, "Ism kamida 3 ta harfdan iborat bo'lishi kerak"),
    password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak").optional().or(z.literal('')),
    confirm_password: z.string().optional().or(z.literal('')),
}).refine((data) => {
    if (data.password && data.password !== data.confirm_password) {
        return false;
    }
    return true;
}, {
    message: "Parollar mos kelmadi",
    path: ["confirm_password"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
