const z = require("zod");

const signupSchema = z.object({
  username: z.string().email(),
  firstName: z.string().min(3).max(20),
  lastName: z.string().min(3).max(20),
  password: z.string().min(8),
});

const signinSchema = z.object({
  username: z.string().email(),
  password: z.string().min(8),
});

const userDataUpdate = z.object({
  firstName: z.string().min(3).max(20),
  lastName: z.string().min(3).max(20),
  password: z.string().min(8),
});

module.exports = {
  signupSchema,
  signinSchema,
  userDataUpdate,
};
