import * as fs from 'fs';
import * as path from 'path';
import { Sermon, Book, Course, ChurchEvent, StudyResource, BroadcastEmail } from '../types.js';

const DB_PATH = path.join(process.cwd(), 'src', 'db', 'db.json');

interface DatabaseSchema {
  sermons: Sermon[];
  books: Book[];
  courses: Course[];
  events: ChurchEvent[];
  resources: StudyResource[];
  emails: BroadcastEmail[];
}

const DEFAULT_DB: DatabaseSchema = {
  sermons: [
    {
      id: "sermon-1",
      title: "Walking Strong in the Ephesians Armor",
      speaker: "Pastor Ken",
      date: "2026-06-07",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      series: "The Whole Armor of God",
      description: "In this opening message, Pastor Ken discusses the spiritual posture described in Ephesians 6. Confronting modern anxieties starts with putting on truth and righteousness.",
      notes: "### Key Study Points:\n1. **The Belt of Truth**: Wrapping our identity in who God says we are, not what the world demands.\n2. **The Breastplate of Righteousness**: Guarding our hearts from accusation and shame through faith.\n3. **Posturing for Peace**: Spiritual battle is won of defensive footing and quiet rest.\n\n*Recommended Reading: Ephesians 6:10-18*"
    },
    {
      id: "sermon-2",
      title: "The Power of a Quiet Heart",
      speaker: "Pastor Ken",
      date: "2026-05-31",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      series: "Quiet Waters",
      description: "Exploring Psalm 23's promise. Calm is not the absence of trouble, but the presence of the Shepherd.",
      notes: "### Reflection Questions:\n- Where in your life are you running ahead of the Shepherd?\n- What 'green pastures' have you been ignoring lately?\n- Spend 10 minutes in silence today, focusing strictly on Psalm 23:1."
    },
    {
      id: "sermon-3",
      title: "Rebuilding the Broken Walls of Community",
      speaker: "Pastor Ken",
      date: "2026-05-24",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      series: "Nehemiah Studies",
      description: "A profound look at Nehemiah's administrative and spiritual leadership in cultivating a healthy, collaborative community.",
      notes: "### Discussion Group Questions:\n1. Nehemiah wept before he worked. How does empathy precede action in our local ministry?\n2. Dealing with ridicule: When Sanballat mocked, Nehemiah prayed. How do we respond to opposition?"
    }
  ],
  books: [
    {
      id: "book-1",
      title: "The Restored Heart",
      author: "Pastor Ken",
      coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
      description: "A manual on emotional and spiritual recovery after periods of severe ministry burn-out or deep personal fatigue. Pastor Ken shares vulnerability and practical steps.",
      downloadUrl: "#",
      pages: 184,
      category: "Spiritual Growth"
    },
    {
      id: "book-2",
      title: "Covenant Grace Unleashed",
      author: "Pastor Ken",
      coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
      description: "Understanding your deep-seated security in the eternal promise. Translating theological concepts of justification and adoption into normal, every-day language.",
      downloadUrl: "#",
      pages: 220,
      category: "Theology"
    }
  ],
  courses: [
    {
      id: "course-1",
      title: "Foundations of Faithful Leadership",
      description: "Learn biblical principles of humility, administrative excellence, and emotional health designed specifically for church workers and coordinators.",
      coverUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400",
      modules: [
        {
          title: "Module 1: The Servant's Posture",
          lessons: [
            {
              title: "1.1 Redefining Influence",
              duration: "12 mins",
              videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
              content: "Influence in the Kingdom is measured by how low we are willing to serve, rather than how many people report to us. In this lesson, we study Christ washing the disciples' feet in John 13."
            },
            {
              title: "1.2 Guarding Your Heart",
              duration: "15 mins",
              content: "Leaders face severe psychological and emotional attack. Let's study how David comforted himself in the Lord in 1 Samuel 30, and build a checklist for spiritual self-care."
            }
          ]
        },
        {
          title: "Module 2: Strategic Stewardship",
          lessons: [
            {
              title: "2.1 Organizing the Sanctuary",
              duration: "18 mins",
              content: "Divine order is not the enemy of the Spirit. Nehemiah's precise distribution of gates teaches us how to delegate and align spiritual gifts with administrative duties."
            }
          ]
        }
      ]
    },
    {
      id: "course-2",
      title: "Interactive Hermeneutics: Reading the Word",
      description: "An easy-to-follow guide to discovering historical contexts, translating idioms, and extracting practical lifegiving application from scripture.",
      coverUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400",
      modules: [
        {
          title: "Module 1: Context is King",
          lessons: [
            {
              title: "1.1 The Cultural Dynamic",
              duration: "20 mins",
              content: "Understanding Eastern metaphors in a Western frame. In this lesson, we breakdown key agricultural symbols like the winnowing fork and early/late rains."
            }
          ]
        }
      ]
    }
  ],
  events: [
    {
      id: "event-1",
      title: "Sunday Family Celebration & Sermon",
      date: "2026-06-21",
      time: "10:00 AM",
      location: "Main Sanctuary & Online Live Portal",
      description: "Join us for a dynamic, life-filled morning service. Special prayer session for students starting summer semesters and families.",
      image: "https://images.unsplash.com/photo-1438243447756-33fcb71e1a3c?auto=format&fit=crop&q=80&w=400",
      type: "service"
    },
    {
      id: "event-2",
      title: "Midweek Interactive Word Study",
      date: "2026-06-24",
      time: "07:00 PM",
      location: "Fellowship Hall & Zoom Studio",
      description: "A relaxed, verse-by-verse discussion. Bring your notebook, hard questions, and a friendly face.",
      image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=400",
      type: "study"
    },
    {
      id: "event-3",
      title: "Overcomers Intercessory Prayer Vigil",
      date: "2026-06-26",
      time: "09:00 PM",
      location: "Sanctuary Altars",
      description: "An intensive night of deep worship and global intercessory prayer. Come and wait in His presence with community leaders.",
      image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=400",
      type: "prayer"
    }
  ],
  resources: [
    {
      id: "res-1",
      title: "Ephesians Armor Study Guide Packet",
      category: "Sermon Companion",
      fileType: "PDF Document",
      description: "Drawn up directly by Pastor Ken, this workbook includes daily devotionals, scriptures to memorize, and active reflection exercises.",
      downloadUrl: "#",
      fileSize: "2.4 MB"
    },
    {
      id: "res-2",
      title: "Churches in Covenant - Administrative Blueprint",
      category: "Church Planting",
      fileType: "Word Template",
      description: "A functional skeleton template for drafting church policies, department roles, and safe volunteer guidelines.",
      downloadUrl: "#",
      fileSize: "1.1 MB"
    }
  ],
  emails: [
    {
      id: "email-1",
      subject: "Walking Together: A Weekly Pastoral Greeting",
      body: "Beloved,\n\nI want to encourage you this week to keep your gaze fixed on the Shepherd. As we discussed on Sunday, rest is a defensive position! Let the Truth shield your thoughts, and keep your heart securely guarded.\n\nBlessings,\nPastor Ken",
      sentAt: "2026-06-08T14:30:00Z",
      recipients: "members",
      status: "sent"
    }
  ]
};

// Check if directory exists
const ensureDbDir = () => {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export function getDb(): DatabaseSchema {
  try {
    ensureDbDir();
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return DEFAULT_DB;
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content) as DatabaseSchema;
  } catch (err) {
    console.error("Error reading database file, returning default database:", err);
    return DEFAULT_DB;
  }
}

export function saveDb(data: DatabaseSchema): boolean {
  try {
    ensureDbDir();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Error writing database file:", err);
    return false;
  }
}
