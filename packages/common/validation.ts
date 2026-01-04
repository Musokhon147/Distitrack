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

export const marketSchema = z.object({
    name: z.string().min(2, "Market nomi kamida 2 ta harf bo'lishi kerak"),
    phone: z.string().min(9, "Telefon raqami noto'g'ri").optional().or(z.literal('')),
});

export const productSchema = z.object({
    name: z.string().min(2, "Mahsulot nomi kamida 2 ta harf bo'lishi kerak"),
});

export const entrySchema = z.object({
    marketNomi: z.string().min(1, "Market tanlanishi kerak"),
    marketRaqami: z.string().optional(),
    mahsulotTuri: z.string().min(1, "Mahsulot tanlanishi kerak"),
    miqdori: z.string().min(1, "Miqdor kiritilishi kerak"),
    narx: z.string().min(1, "Narx kiritilishi kerak"),
    tolovHolati: z.enum(["to'langan", "to'lanmagan", "kutilmoqda"]),
});

export type MarketInput = z.infer<typeof marketSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type EntryInput = z.infer<typeof entrySchema>;
