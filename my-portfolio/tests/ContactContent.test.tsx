import { render } from "./renderPortfolio";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { ContactContent } from "@/components/windows/ContactContent";
import { portfolioData } from "@/data/portfolioData";

describe("ContactContent Component", () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { received: true } }) }));
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    Object.assign(navigator, {
      clipboard: originalClipboard,
    });
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders Let's Work headline, contact me script, and action buttons", () => {
    render(<ContactContent />);

    // Large groovy retro script headline
    expect(screen.getByText(/Let's Work/i)).toBeInTheDocument();

    // Cursive subtitle
    expect(screen.getByText(/contact me/i)).toBeInTheDocument();

    // Pixel mouse cursor
    const cursor = screen.getByAltText(/pixel cursor|mouse cursor/i);
    expect(cursor).toBeInTheDocument();
    expect(cursor).toHaveAttribute("src", "/icons/Windows_mouse.png");
  });

  it("renders all four pill-shaped action buttons matching design", () => {
    render(<ContactContent />);

    // Blue pill: GitHub
    const githubPill = screen.getByRole("link", {
      name: /FOLLOW ME @trtrnguyen14104/i,
    });
    expect(githubPill).toBeInTheDocument();
    expect(githubPill).toHaveAttribute("href", portfolioData.profile.github);

    // Purple pill: Email
    expect(screen.getByText("trtrnguyen14104@gmail.com")).toBeInTheDocument();

    // LinkedIn pill
    const linkedinPill = screen.getByRole("link", {
      name: /Trần Trung Nguyên/i,
    });
    expect(linkedinPill).toBeInTheDocument();
    expect(linkedinPill).toHaveAttribute("href", portfolioData.profile.linkedin);

    // Phone pill
    expect(screen.getByText("0354066043")).toBeInTheDocument();
  });

  it("copies email address to clipboard and shows toast notification when email pill is clicked", async () => {
    render(<ContactContent />);

    const emailButton = screen.getByRole("button", {
      name: /copy email/i,
    });
    fireEvent.click(emailButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      portfolioData.profile.email
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Email copied to clipboard/i)
      ).toBeInTheDocument();
    });
  });

  it("copies phone number to clipboard when phone pill is clicked", async () => {
    render(<ContactContent />);

    const phoneButton = screen.getByRole("button", {
      name: /copy phone|phone/i,
    });
    fireEvent.click(phoneButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      portfolioData.profile.phone
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Phone copied to clipboard/i)
      ).toBeInTheDocument();
    });
  });

  it("renders retro Windows Mail / Outlook Express email composer dialog", () => {
    render(<ContactContent />);

    // Title / header of retro mail
    expect(
      screen.getByText(/Windows Mail|Outlook Express|Send a Message/i)
    ).toBeInTheDocument();

    // To recipient field
    expect(screen.getByDisplayValue(portfolioData.profile.email)).toBeInTheDocument();

    // Form inputs
    expect(screen.getByPlaceholderText(/Subject/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Write your message here/i)
    ).toBeInTheDocument();

    // Send button
    expect(screen.getByRole("button", { name: /Send Message|Send/i })).toBeInTheDocument();
  });

  it("handles email form submission with validation and feedback", async () => {
    render(<ContactContent />);

    const sendButton = screen.getByRole("button", { name: /Send Message|Send/i });
    const subjectInput = screen.getByPlaceholderText(/Subject/i);
    const messageInput = screen.getByPlaceholderText(/Write your message here/i);

    // Try sending empty form
    fireEvent.click(sendButton);
    expect(
      screen.getByText(/Please enter a subject and message/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Your Name"), { target: { value: "Visitor" } });
    fireEvent.change(screen.getByPlaceholderText("Your Email"), { target: { value: "visitor@example.com" } });

    // Fill in form
    fireEvent.change(subjectInput, {
      target: { value: "Exciting Opportunity" },
    });
    fireEvent.change(messageInput, {
      target: {
        value: "Hi Nguyen, I loved your portfolio and would like to talk!",
      },
    });

    // Send form
    fireEvent.click(sendButton);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(
        /Message received! Thank you for reaching out/i
      );
    });
  });

  it("preserves input and the submission ID after a failed request, then accepts a retry", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: { message: "Service unavailable" } }) } as Response);
    render(<ContactContent />);
    fireEvent.change(screen.getByPlaceholderText("Your Name"), { target: { value: "Visitor" } });
    fireEvent.change(screen.getByPlaceholderText("Your Email"), { target: { value: "visitor@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Subject/i), { target: { value: "Opportunity" } });
    fireEvent.change(screen.getByPlaceholderText(/Write your message here/i), { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    await screen.findByText("Service unavailable");
    expect(screen.getByPlaceholderText(/Write your message here/i)).toHaveValue("Hello");
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    await screen.findByText("Message received! Thank you for reaching out.");
    const first = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    const second = JSON.parse(fetchMock.mock.calls[1][1]!.body as string);
    expect(second.submissionId).toBe(first.submissionId);
    expect(screen.getByPlaceholderText(/Write your message here/i)).toHaveValue("");
  });
});
