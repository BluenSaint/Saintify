import { defineWorkflow, defineActivity } from "@temporalio/workflow";
import { PlatformPost } from "@/lib/platforms/basePlatform";

interface PostWorkflowInput {
  postId: string;
  platform: string;
  content: string;
  scheduledTime: Date;
}

export const postActivity = defineActivity<{
  postId: string;
  platform: string;
  content: string;
}>("post-activity");

export const postWorkflow = defineWorkflow({
  name: "post-workflow",
  activities: [postActivity],
  execute: async ({
    input,
    activities: { postActivity },
  }: {
    input: PostWorkflowInput;
    activities: {
      postActivity: ReturnType<typeof postActivity>;
    };
  }) => {
    const { postId, platform, content, scheduledTime } = input;

    // Wait until scheduled time
    const now = new Date();
    if (scheduledTime > now) {
      await new Promise((resolve) => setTimeout(resolve, scheduledTime - now));
    }

    // Execute the post activity
    const result = await postActivity({
      postId,
      platform,
      content,
    });

    return result;
  },
});
