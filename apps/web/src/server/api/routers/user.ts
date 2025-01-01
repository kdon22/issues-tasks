export const userRouter = router({
  // ... other routes

  updateProfile: publicProcedure
    .input(z.object({
      name: z.string().optional(),
      nickname: z.string().optional(),
      icon: z.string().optional(),
      iconColor: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id
      if (!userId) throw new Error('Not authenticated')

      return await ctx.db.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          nickname: input.nickname,
          icon: input.icon,
          iconColor: input.iconColor,
        },
      })
    }),

  getProfile: publicProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session?.user?.id
      if (!userId) throw new Error('Not authenticated')

      return await ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          icon: true,
          iconColor: true,
          nickname: true,
        },
      })
    }),
}) 