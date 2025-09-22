// Mock data for the Todo app
export const mockTasks = [
  {
    id: 1,
    title: "Attend Nischal's Birthday Party",
    description:
      "Buy gifts on the way and pick up cake from the bakery. (6 PM | Fresh Elements)....",
    status: "Not Started",
    priority: "Moderate",
    createdAt: "20/09/2025",
    image: "/party.jpg",
  },
  {
    id: 2,
    title: "Landing Page Design for TravelDays",
    description:
      "Get the work done by EOD and discuss with client before leaving. (4 PM | Meeting Room)",
    status: "In Progress",
    priority: "Moderate",
    createdAt: "20/09/2025",
    image: "/travel.jpg",
  },
  {
    id: 3,
    title: "Presentation on Final Product",
    description:
      "Make sure everything is functioning and all the necessities are properly met. Prepare the team and get the documents ready for delivery.",
    status: "In Progress",
    priority: "Moderate",
    createdAt: "19/09/2025",
    image: "/presentation.jpg",
  },
];

export const mockCompletedTasks = [
  {
    id: 4,
    title: "Walk the dog",
    description: "Take the dog to the park and bring treats as well.",
    status: "Completed",
    priority: "Low",
    createdAt: "18/09/2025",
    image: "/dog.jpg",
  },
  {
    id: 5,
    title: "Conduct meeting",
    description: "Meet with the client and finalize requirements.",
    status: "Completed",
    priority: "Extreme",
    createdAt: "18/09/2025",
    image: "/meeting.jpg",
  },
];

export const mockStatuses = [
  { id: 1, status: "Completed" },
  { id: 2, status: "In Progress" },
  { id: 3, status: "Not Started" },
];

export const mockPriorities = [
  { id: 1, priority: "Extreme" },
  { id: 2, priority: "Moderate" },
  { id: 3, priority: "Low" },
];

export const mockChartData = [
  { name: "Completed", value: 84 },
  { name: "In Progress", value: 46 },
  { name: "Not Started", value: 13 },
];
