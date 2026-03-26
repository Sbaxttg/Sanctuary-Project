/** OpenAI Chat Completions `tools` entries — names must match handlers in AISanctuaryContext. */

export const OPENAI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "shuffle_wall_quotes",
      description:
        "Shuffle / refresh the motivational quote wall on the Home (Wall of Wisdom) dashboard. Use when the user asks for new quotes, random quotes, or to refresh the wall.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_calendar_event",
      description:
        "Create a calendar event on the Sanctuary calendar grid for a specific date. dateKey must be yyyy-mm-dd in the user's local intent (infer from 'tomorrow', weekday names, etc.).",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Event title e.g. Meeting with Sarah" },
          dateKey: {
            type: "string",
            description: "Date in yyyy-mm-dd format for the day the event occurs",
          },
        },
        required: ["title", "dateKey"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_notes",
      description:
        "Search the user's notes (titles + body text + tags) and return matching note titles/snippets.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search phrase e.g. architecture project" },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "notes_add_tag",
      description: "Add a hashtag tag to the currently open note (Notes page).",
      parameters: {
        type: "object",
        properties: {
          tag: { type: "string", description: "Tag without or with # prefix" },
        },
        required: ["tag"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "email_open_compose_draft",
      description:
        "Open the email compose modal with optional pre-filled body/subject/to for a reply or new message. Requires Email page and usually Gmail connected.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "Recipient email (optional)" },
          subject: { type: "string" },
          body: { type: "string", description: "Draft body text" },
        },
        required: ["body"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "fitness_add_exercise",
      description: "Append a new line to the Active Routine list on the Fitness page.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Exercise name e.g. 30 min HIIT" },
          meta: { type: "string", description: "Optional sets/reps line e.g. 1 session • 30 min" },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
];

export type ToolName = (typeof OPENAI_TOOLS)[number]["function"]["name"];
