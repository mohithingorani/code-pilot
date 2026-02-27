import zod from "zod";

export const UserSchema = zod.object({
    email: zod.email(),
    password: zod.string(),
});
