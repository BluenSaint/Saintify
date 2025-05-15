import { InstagramService } from "../instagramService";
import { Instagram } from "instagram-web-api";

// Mock Instagram client
jest.mock("instagram-web-api", () => {
  return {
    Instagram: jest.fn().mockImplementation(() => {
      return {
        login: jest.fn(),
        publishPhoto: jest.fn(),
        getMediaLikes: jest.fn(),
        getMediaComments: jest.fn(),
      };
    }),
  };
});

describe("InstagramService", () => {
  let service: InstagramService;
  const mockConfig = {
    username: "test_user",
    password: "test_password",
  };

  beforeEach(() => {
    service = new InstagramService(mockConfig);
  });



  describe("authenticate", () => {
    it("should authenticate with Instagram", async () => {
      // Mock the Instagram client login
      const client = new Instagram({
        username: mockConfig.username,
        password: mockConfig.password,
      });
      jest.spyOn(client, "login").mockResolvedValue(undefined);
      service.client = client;

      await service.authenticate();

      expect(client.login).toHaveBeenCalled();
    });
  });

  describe("publish", () => {
    it("should publish content to Instagram", async () => {
      // Mock the Instagram client publishPhoto
      const mockPost = {
        id: "123",
      };
      const client = new Instagram({
        username: mockConfig.username,
        password: mockConfig.password,
      });
      jest.spyOn(client, "publishPhoto").mockResolvedValue(mockPost);
      service.client = client;

      const content = "Test post content";
      const result = await service.publish(content);

      expect(client.publishPhoto).toHaveBeenCalledWith({
        caption: content,
        image: expect.any(String),
      });
      expect(result).toEqual({
        id: mockPost.id,
        content,
        platform: "instagram",
        postId: mockPost.id,
        timestamp: expect.any(Date),
        metadata: {
          likes: 0,
          comments: 0,
          shares: 0,
        },
      });
    });
  });

  describe("getInteractions", () => {
    it("should get interactions for a post", async () => {
      const mockPostId = "123";
      const mockInteractions = [{ id: "456" }];
      const client = new Instagram({
        username: mockConfig.username,
        password: mockConfig.password,
      });
      jest.spyOn(client, "getMediaLikes").mockResolvedValue(mockInteractions);
      service.client = client;

      const result = await service.getInteractions(mockPostId);

      expect(client.getMediaLikes).toHaveBeenCalledWith(mockPostId);
      expect(result).toEqual(mockInteractions);
    });
  });
});
