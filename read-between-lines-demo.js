const assets = {
  maps: {
    main: "assets/read-between-lines/maps/main-map.png",
    office: "assets/read-between-lines/maps/office.png",
    restaurant: "assets/read-between-lines/maps/restaurant.png",
    subway: "assets/read-between-lines/maps/subway.png",
    home: "assets/read-between-lines/maps/home.png",
    cafe: "assets/read-between-lines/maps/cafe.png",
    store: "assets/read-between-lines/maps/store.png",
    park: "assets/read-between-lines/maps/park.png"
  },
  characters: {
    player: "assets/read-between-lines/characters/player-male.png",
    boss: "assets/read-between-lines/characters/boss.png",
    xiaoli: "assets/read-between-lines/characters/xiaoli.png",
    coworker: "assets/read-between-lines/characters/coworker-male.png",
    mom: "assets/read-between-lines/characters/mom.png",
    aunt: "assets/read-between-lines/characters/aunt.png",
    cousin: "assets/read-between-lines/characters/cousin.png",
    akai: "assets/read-between-lines/characters/akai.png",
    emma: "assets/read-between-lines/characters/emma.png"
  }
};

const places = {
  home: { label: "Home", x: 31, y: 24 },
  company: { label: "Company", x: 72, y: 28 },
  subway: { label: "Subway Station", x: 50, y: 44 },
  restaurant: { label: "Restaurant", x: 25, y: 56 },
  cafe: { label: "Cafe", x: 82, y: 49 },
  park: { label: "Park", x: 51, y: 67 },
  store: { label: "Convenience Store", x: 77, y: 70 }
};

const initialStats = {
  money: 1000,
  energy: 80,
  mood: 80,
  boss: 30,
  coworker: 30,
  family: 70,
  friend: 50,
  reputation: 30
};

const state = {
  day: 1,
  openEventId: null,
  lastShownDay: 1,
  stats: { ...initialStats },
  flags: new Set(),
  memories: [],
  completed: new Set()
};

const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const events = [
  {
    id: "d1_intro",
    day: 1,
    slot: "Morning",
    type: "scene",
    place: "company",
    location: "Office / Elevator",
    title: "First Impression",
    npc: "boss",
    map: "office",
    summary: "Something may happen at Company.",
    body: [
      "It is your first morning at the company. Most people are already working.",
      "Near the elevator, Manager Zhang walks out of a meeting room. He has not noticed you yet.",
      "What do you do?"
    ],
    choices: [
      {
        text: "Smile and greet him first.",
        playerLine: "Good morning, Mr. Zhang. I'm Alex, the new intern. Nice to meet you.",
        effects: { boss: 8, reputation: 5, mood: 1 },
        flags: ["boss_remembers_name"],
        feedback: "Mr. Zhang pauses, then nods. \"Ah, you're the new hire.\" The exchange is short, but now he knows your name.",
        memory: "You introduced yourself to Mr. Zhang before he had to ask."
      },
      {
        text: "Wait to see if he notices you first.",
        playerLine: "You keep arranging your desk and wait.",
        effects: { boss: 1 },
        flags: ["boss_neutral_intro"],
        feedback: "Mr. Zhang walks past. Nothing awkward happens. Nothing memorable happens either.",
        memory: "Your first meeting with Mr. Zhang stayed neutral."
      },
      {
        text: "Pretend you did not see him and look at your phone.",
        playerLine: "You lower your eyes to your phone.",
        effects: { boss: -3, reputation: -2, mood: 1 },
        flags: ["boss_does_not_remember_player"],
        feedback: "Mr. Zhang glances in your direction but says nothing.",
        memory: "Mr. Zhang saw you, but you avoided the first greeting."
      }
    ]
  },
  {
    id: "d1_lunch",
    day: 1,
    slot: "Noon",
    type: "scene",
    place: "restaurant",
    location: "Restaurant / Office",
    title: "Lunch Invitation",
    npc: "xiaoli",
    map: "restaurant",
    summary: "Xiao Li is inviting you to lunch.",
    body: [
      "Xiao Li stops by your desk with her bag already on her shoulder.",
      "\"We're heading out for lunch. Want to come with us?\""
    ],
    choices: [
      {
        text: "Join them.",
        playerLine: "Sure. I'd love to join you guys.",
        effects: { coworker: 10, mood: 5, money: -30, energy: -3 },
        flags: ["joined_lunch_day1"],
        feedback: "Lunch starts awkwardly, then slowly gets easier. You learn who talks the most and who everyone listens to.",
        memory: "You joined the team lunch on your first day."
      },
      {
        text: "Decline politely.",
        playerLine: "Thanks for inviting me. I brought lunch today, but maybe next time?",
        effects: { coworker: 2, reputation: 2 },
        flags: ["declined_lunch_politely_day1"],
        feedback: "Xiao Li smiles and says, \"No worries.\" The interaction stays polite.",
        memory: "You declined lunch politely."
      },
      {
        text: "Stay and finish onboarding tasks.",
        playerLine: "I still have a lot to finish. You guys go ahead.",
        effects: { coworker: -5, reputation: 3, energy: -2, mood: -2 },
        flags: ["missed_lunch_day1"],
        feedback: "You finish several tasks, but when everyone returns laughing, you realize you missed something.",
        memory: "You chose work over the first team lunch."
      }
    ]
  },
  {
    id: "d1_mom",
    day: 1,
    slot: "Evening",
    type: "wechat",
    contact: "Mom",
    avatar: "mom",
    place: "wechat",
    summary: "Mom has sent you a message.",
    incoming: [
      { from: "mom", text: "How was your first day?", time: "18:30" },
      { from: "mom", text: "Was everyone nice to you?", time: "18:31" }
    ],
    choices: [
      {
        text: "Tell her honestly that it went well.",
        playerLine: "It actually went better than I expected. Everyone has been pretty nice so far.",
        effects: { family: 8, mood: 3 },
        flags: ["mom_feels_included"],
        feedbackLine: "That's good. Tell Mom if anything happens, okay?",
        feedback: "Mom sends several follow-up messages. It is a little overwhelming, but comforting.",
        memory: "You let Mom into your first-day feelings."
      },
      {
        text: "Keep it brief.",
        playerLine: "Pretty good. Nothing special.",
        effects: { family: 2, mood: 1 },
        flags: ["mom_neutral_reply_day1"],
        feedbackLine: "Okay. Remember to eat properly.",
        feedback: "Mom sends a thumbs-up sticker. The conversation ends quickly.",
        memory: "You gave Mom a short first-day update."
      },
      {
        text: "Leave the message unread.",
        playerLine: "...",
        effects: { family: -8, mood: -2 },
        flags: ["mom_ignored_day1"],
        feedbackLine: "The message sits there all night.",
        feedback: "You know she will notice, but you cannot make yourself answer.",
        memory: "You did not reply to Mom on Day 1."
      }
    ]
  },
  {
    id: "d1_subway",
    day: 1,
    slot: "Night",
    type: "scene",
    place: "subway",
    location: "Subway",
    title: "Wrong Exit",
    npc: "player",
    map: "subway",
    summary: "You may have taken the wrong subway exit.",
    body: [
      "You leave through the wrong subway exit and the streets look unfamiliar.",
      "Your feet hurt. The city suddenly feels much bigger."
    ],
    choices: [
      { text: "Use maps immediately.", playerLine: "You open maps and correct course.", effects: { energy: -2, mood: -1 }, flags: ["used_maps_day1"], feedback: "It is not elegant, but it works. You get home later than planned.", memory: "You solved the wrong-exit problem quickly." },
      { text: "Try to figure it out alone.", playerLine: "You walk a few blocks, hoping the area starts making sense.", effects: { energy: -5, mood: -4 }, flags: ["got_lost_day1"], feedback: "The streets keep looping. By the time you get home, you are exhausted.", memory: "You got lost trying to handle the subway alone." },
      { text: "Take a taxi home.", playerLine: "You give up and call a taxi.", effects: { money: -80, energy: -1, mood: 2 }, flags: ["taxi_day1"], feedback: "It costs more than you wanted, but the ride home feels like mercy.", memory: "You spent money to protect your energy." }
    ]
  },
  {
    id: "d2_boss",
    day: 2,
    slot: "Morning",
    type: "scene",
    place: "company",
    location: "Office / Meeting Room",
    title: "Boss Feedback",
    npc: "boss",
    map: "office",
    summary: "Mr. Zhang wants to discuss your draft.",
    intro: () => {
      if (hasFlag("boss_remembers_name")) return "Mr. Zhang looks directly at you. \"Alex, bring your draft to the meeting room later.\"";
      if (hasFlag("boss_does_not_remember_player")) return "Mr. Zhang glances at you. \"You are... Alex, right? Bring your draft to the meeting room later.\"";
      return "Mr. Zhang checks the attendance list before saying your name. \"Alex, bring your draft to the meeting room later.\"";
    },
    body: [
      "He reads your onboarding assignment and says, \"This part needs work.\"",
      "He does not immediately explain which part."
    ],
    choices: [
      { text: "Say you will revise it right away.", playerLine: "Got it. I'll revise it right away.", effects: { boss: 4, reputation: 2, energy: -4 }, flags: ["acted_fast_without_clarity"], feedback: "Mr. Zhang appreciates the speed, but you still are not sure what he wanted changed.", memory: "You acted fast before fully clarifying the feedback." },
      { text: "Ask for the exact concern.", playerLine: "Could you point me to the main concern first? I want to make the revision useful.", effects: { boss: 7, reputation: 4, mood: 2 }, flags: ["asked_for_clarity"], feedback: "Mr. Zhang explains the issue in more detail. You leave with a clearer direction.", memory: "You asked Mr. Zhang for clarity instead of guessing." },
      { text: "Defend your draft.", playerLine: "I thought this was already what the brief asked for.", effects: { boss: -8, reputation: -4, mood: -3 }, flags: ["boss_thinks_defensive"], feedback: "The room gets quiet. Mr. Zhang says, \"Let's revisit this later.\"", memory: "Mr. Zhang saw you as defensive in the meeting." }
    ]
  },
  {
    id: "d2_group",
    day: 2,
    slot: "Afternoon",
    type: "wechat",
    contact: "Project Team",
    avatar: "group",
    group: true,
    place: "wechat",
    summary: "The company group chat is active.",
    incoming: [
      { from: "boss", text: "Please send a short meeting summary to the group.", time: "14:10" },
      { from: "xiaoli", text: "Anyone taking notes?", time: "14:12" }
    ],
    choices: [
      { text: "Volunteer and send a clean summary.", playerLine: "I can organize the notes and send a summary.", effects: { coworker: 5, reputation: 8, energy: -4 }, flags: ["sent_group_summary"], feedbackLine: "Thanks, Alex. This is clear.", feedback: "Several coworkers thank you. Your name starts becoming familiar.", memory: "You became visible by helping in the company group chat." },
      { text: "Send your notes privately to Xiao Li.", playerLine: "Xiao Li, I have notes if that helps.", effects: { coworker: 4, reputation: 2 }, flags: ["helped_xiaoli_notes"], feedbackLine: "Thank you! I'll clean them up.", feedback: "You help without looking too eager to perform.", memory: "You helped Xiao Li quietly with meeting notes." },
      { text: "Stay silent.", playerLine: "...", effects: { reputation: -2 }, flags: ["silent_in_group_day2"], feedbackLine: "The chat moves on without you.", feedback: "Nothing bad happens. Nothing opens up either.", memory: "You stayed silent when the group needed help." }
    ]
  },
  {
    id: "d2_family_group",
    day: 2,
    slot: "Night",
    type: "wechat",
    contact: "Family Group",
    avatar: "group",
    group: true,
    place: "wechat",
    summary: "Family group chat has a sensitive question.",
    incoming: [
      { from: "aunt", text: "You started working now. Any dating plans?", time: "21:05" },
      { from: "mom", text: "Don't pressure the child.", time: "21:06" }
    ],
    choices: [
      { text: "Deflect with humor.", playerLine: "Let me survive probation first, Auntie.", effects: { family: 3, mood: 1 }, flags: ["deflected_aunt_humor"], feedbackLine: "Haha, okay, work comes first.", feedback: "The group laughs and the topic moves on.", memory: "You handled family pressure with humor." },
      { text: "Let Mom help you exit the topic.", playerLine: "Mom is right. Work is already a lot this week.", effects: { family: 5, mood: 1 }, flags: ["mom_protected_player"], feedbackLine: "Your mom says you just started work and need time.", feedback: "Mom shields you without making things tense.", memory: "Mom helped you out in the family group." },
      { text: "Answer bluntly.", playerLine: "Can we not talk about this?", effects: { family: -6, mood: -3 }, flags: ["family_group_tense"], feedbackLine: "The group goes quiet. Mom messages you privately: \"Are you in a bad mood?\"", feedback: "You escaped the question, but the silence feels heavy.", memory: "The family group went quiet after your blunt reply." }
    ]
  },
  {
    id: "d2_phone",
    day: 2,
    slot: "Evening",
    type: "scene",
    place: "subway",
    location: "Subway",
    title: "Dead Phone",
    npc: "player",
    map: "subway",
    summary: "Your phone is almost out of battery.",
    body: ["On the way home, your phone dies. No maps, no messages, no payment app."],
    choices: [
      { text: "Borrow a charger from station staff.", playerLine: "You ask the station desk for help.", effects: { energy: -2, mood: 1 }, flags: ["borrowed_charger"], feedback: "It feels embarrassing for two seconds. Then it feels practical.", memory: "You asked for help when your phone died." },
      { text: "Take the route from memory.", playerLine: "You trust your memory and keep moving.", effects: { energy: -4, mood: -2 }, flags: ["phone_dead_walked"], feedback: "You make it, but every turn feels like a small test.", memory: "You navigated home without your phone." },
      { text: "Buy a power bank.", playerLine: "You buy the cheapest power bank nearby.", effects: { money: -120, mood: 2 }, flags: ["bought_power_bank"], feedback: "Your wallet complains. Your nervous system relaxes.", memory: "You bought a power bank after your phone died." }
    ]
  },
  {
    id: "d3_client",
    day: 3,
    slot: "Morning",
    type: "scene",
    place: "company",
    location: "Office / Meeting Room",
    title: "Client Meeting",
    npc: "boss",
    map: "office",
    summary: "A client meeting may test your judgment.",
    intro: () => hasFlag("asked_for_clarity") ? "Because you clarified yesterday, Mr. Zhang looks more willing to hear you." : "Mr. Zhang glances at you only briefly before the meeting starts.",
    body: ["During the client meeting, Mr. Zhang suddenly asks, \"Alex, what do you think?\"", "Everyone turns toward you."],
    choices: [
      { text: "Point out the problem directly.", playerLine: "I think the client's current idea will not work.", effects: { boss: -3, reputation: 2, mood: -2 }, flags: ["client_comment_too_direct"], feedback: "You are not necessarily wrong, but the room stiffens.", memory: "Your client feedback was correct but too direct." },
      { text: "Frame the issue gently.", playerLine: "There may be a risk in this part. Maybe we can adjust the plan before it becomes expensive.", effects: { boss: 8, reputation: 6, mood: 2 }, flags: ["client_comment_tactful"], feedback: "Mr. Zhang nods. You named the problem without cornering anyone.", memory: "You handled client feedback with tact." },
      { text: "Say you need more time.", playerLine: "I need to look at the details more before I comment.", effects: { reputation: -2, boss: -1 }, flags: ["client_comment_avoided"], feedback: "The meeting moves on. You avoided risk, but also missed a chance.", memory: "You avoided speaking in the client meeting." }
    ]
  },
  {
    id: "d3_tea",
    day: 3,
    slot: "Afternoon",
    type: "scene",
    place: "company",
    location: "Office / Pantry",
    title: "Office Tea Break",
    npc: "xiaoli",
    map: "office",
    summary: "There are snacks in the pantry.",
    body: ["Someone brought afternoon tea. The pantry is louder than usual.", "Xiao Li is standing near the snack table."],
    choices: [
      { text: "Take one and bring one to Xiao Li.", playerLine: "I grabbed one for you too.", effects: { coworker: 7, reputation: 2, money: 0 }, flags: ["brought_snack_xiaoli"], feedback: "Xiao Li laughs. Small gestures travel faster than formal introductions.", memory: "You gave Xiao Li a small pantry kindness." },
      { text: "Take one quietly.", playerLine: "You take a snack and return to your seat.", effects: { mood: 1 }, flags: ["quiet_tea_break"], feedback: "It is a small private reset in the middle of the day.", memory: "You used afternoon tea as a quiet reset." },
      { text: "Skip it and keep working.", playerLine: "You stay at your desk.", effects: { reputation: 1, energy: -2, mood: -1 }, flags: ["skipped_tea_break"], feedback: "You get more done, but the office feels further away.", memory: "You skipped the pantry moment to keep working." }
    ]
  },
  {
    id: "d3_dinner",
    day: 3,
    slot: "Noon",
    type: "scene",
    place: "restaurant",
    location: "Restaurant",
    title: "Team Meal",
    npc: "xiaoli",
    map: "restaurant",
    summary: "Xiao Li asks about eating with the team.",
    body: ["Xiao Li says, \"Some of us are eating together. You coming?\""],
    choices: [
      { text: "Join even though you are tired.", playerLine: "Yeah, I'll come.", effects: { coworker: 8, mood: 2, money: -45, energy: -5 }, flags: ["joined_team_meal_day3"], feedback: "The meal is loud and tiring, but people start treating you like part of the team.", memory: "You joined the team meal despite being tired." },
      { text: "Decline again.", playerLine: "I have something to finish. Maybe next time.", effects: { coworker: -4, reputation: 1 }, flags: ["declined_meal_day3"], feedback: "Xiao Li says it is fine, but everyone leaves together.", memory: "You declined another team meal." },
      { text: "Show up briefly.", playerLine: "I can stop by for a bit.", effects: { coworker: 4, money: -20, energy: -2 }, flags: ["brief_team_meal_day3"], feedback: "You appear, laugh at two jokes, and leave before you drain completely.", memory: "You made a short appearance at the team meal." }
    ]
  },
  {
    id: "d3_mom_weekend",
    day: 3,
    slot: "Evening",
    type: "wechat",
    contact: "Mom",
    avatar: "mom",
    place: "wechat",
    summary: "Mom asks about the weekend.",
    incoming: [
      { from: "mom", text: "Are you coming home this weekend?", time: "19:40" }
    ],
    choices: [
      { text: "Promise to come back.", playerLine: "Yes. I'll come home this weekend.", effects: { family: 8, mood: 2 }, flags: ["promised_weekend_home"], feedbackLine: "Great. What do you want to eat?", feedback: "Mom immediately starts planning food.", memory: "You promised Mom you would come home this weekend." },
      { text: "Say work may be busy.", playerLine: "I'm not sure yet. Work may be busy.", effects: { family: hasFlag("mom_feels_included") ? 2 : -2, mood: -1 }, flags: ["work_may_block_weekend"], feedbackLine: hasFlag("mom_feels_included") ? "Okay, work first. Just don't overdo it." : "I see. Then rest when you can.", feedback: "Her reply is understanding, but shorter than usual.", memory: "You warned Mom that work might block the weekend." },
      { text: "Avoid answering clearly.", playerLine: "Let's talk later.", effects: { family: -6, mood: -2 }, flags: ["avoided_weekend_question"], feedbackLine: "Okay.", feedback: "Mom does not continue the conversation.", memory: "You avoided Mom's weekend question." }
    ]
  },
  {
    id: "d4_rain",
    day: 4,
    slot: "Morning",
    type: "scene",
    place: "subway",
    location: "Subway",
    title: "Sudden Rain",
    npc: "player",
    map: "subway",
    summary: "It is raining at the subway station.",
    body: ["Morning rain hits hard. You forgot an umbrella."],
    choices: [
      { text: "Run through it.", playerLine: "You run to the station entrance.", effects: { energy: -4, mood: -2 }, flags: ["ran_in_rain"], feedback: "You arrive damp and annoyed.", memory: "You started Day 4 soaked by rain." },
      { text: "Buy an umbrella.", playerLine: "You buy an umbrella from the kiosk.", effects: { money: -60, mood: 1 }, flags: ["bought_umbrella"], feedback: "It feels like a boring purchase until the rain gets worse.", memory: "You bought an umbrella instead of gambling." },
      { text: "Wait it out.", playerLine: "You wait under the station awning.", effects: { energy: -1, reputation: -1 }, flags: ["waited_rain"], feedback: hasStat("coworker", 50) ? "Xiao Li spots you and shares her umbrella for the short walk." : "The rain slows, but you arrive late.", memory: "You waited out the rain at the station." }
    ]
  },
  {
    id: "d4_weekend",
    day: 4,
    slot: "Afternoon",
    type: "scene",
    place: "company",
    location: "Office / Boss Area",
    title: "Weekend Question",
    npc: "boss",
    map: "office",
    summary: "Mr. Zhang asks about your weekend.",
    body: ["Friday afternoon, Mr. Zhang stops by your desk.", "\"Do you have any plans this weekend?\""],
    choices: [
      { text: "Say you are available.", playerLine: "No major plans. I can help if needed.", effects: { boss: 7, reputation: 4, energy: -8 }, flags: ["weekend_available"], feedback: "Mr. Zhang nods. \"Good. I'll send you the materials later.\" Your weekend becomes less like a weekend.", memory: "You made yourself available for weekend work." },
      { text: "Set a soft boundary.", playerLine: "I have family plans, but I can send what I have before I leave.", effects: { boss: 3, reputation: 5, mood: 1 }, flags: ["set_soft_boundary"], feedback: "Mr. Zhang pauses. \"Alright. Send me what you have before you leave.\"", memory: "You stayed reliable while setting a boundary." },
      { text: "Say you are busy.", playerLine: "Sorry, I'm busy this weekend.", effects: { boss: -7, reputation: -2 }, flags: ["boss_cold_deadline"], feedback: "Mr. Zhang's expression changes. \"Never mind.\" It does not sound like nothing.", memory: "Mr. Zhang did not like your weekend answer." }
    ]
  },
  {
    id: "d4_friend",
    day: 4,
    slot: "Evening",
    type: "wechat",
    contact: "Akai",
    avatar: "akai",
    place: "wechat",
    summary: "Akai says you disappeared.",
    incoming: [
      { from: "akai", text: "You alive? You disappeared after starting work.", time: "20:20" }
    ],
    choices: [
      { text: "Apologize and explain.", playerLine: "I'm alive. Sorry, the first week has been a lot. I didn't mean to disappear.", effects: { friend: 8, mood: 2 }, flags: ["friend_reassured"], feedbackLine: "Haha, okay. Don't vanish forever.", feedback: "The chat starts feeling normal again.", memory: "You repaired the silence with Akai." },
      { text: "Reply briefly.", playerLine: "Busy week. I'll catch up later.", effects: { friend: 1 }, flags: ["friend_brief_reply"], feedbackLine: "Alright, don't disappear forever.", feedback: "He accepts it, but the warmth does not fully return.", memory: "You replied to Akai, but kept distance." },
      { text: "Ignore it for now.", playerLine: "...", effects: { friend: -8, mood: -2 }, flags: ["friend_ignored_day4"], feedbackLine: "The message stays there.", feedback: "You know you will have to handle this eventually.", memory: "You left Akai's message unanswered." }
    ]
  },
  {
    id: "d4_cousin",
    day: 4,
    slot: "Night",
    type: "wechat",
    contact: "Cousin",
    avatar: "cousin",
    place: "wechat",
    summary: "A cousin mentions a different job.",
    incoming: [
      { from: "cousin", text: "A friend has an opening at another company. Want me to introduce you?", time: "22:05" }
    ],
    choices: [
      { text: "Thank him but do not commit.", playerLine: "Thanks. Could you send me the info first? I just started here, so I want to think carefully.", effects: { family: 3, reputation: 1 }, flags: ["job_lead_open"], feedbackLine: "Sure. No pressure.", feedback: "He feels you accepted the kindness without promising too much.", memory: "You kept the job lead open politely." },
      { text: "Say no clearly.", playerLine: "Thanks, but I'm not looking right now.", effects: { family: 1 }, flags: ["job_lead_declined"], feedbackLine: "Got it.", feedback: "The conversation stays simple.", memory: "You declined the outside job lead." },
      { text: "Ignore the suggestion.", playerLine: "...", effects: { family: -3 }, flags: ["job_lead_ignored"], feedbackLine: "No reply.", feedback: "Later, family may think you do not appreciate help.", memory: "You ignored your cousin's job suggestion." }
    ]
  },
  {
    id: "d5_deadline",
    day: 5,
    slot: "Morning",
    type: "scene",
    place: "company",
    location: "Office",
    title: "Client Plan Deadline",
    npc: "boss",
    map: "office",
    summary: "The deadline task arrives.",
    intro: () => {
      if (hasFlag("boss_cold_deadline")) return "Mr. Zhang's message is unusually short.";
      if (hasFlag("set_soft_boundary")) return "Mr. Zhang sends the task with enough context to start.";
      return "Mr. Zhang sends a stack of materials before you have finished your coffee.";
    },
    body: ["Mr. Zhang messages: \"Client plan is due today. I need your part before 6.\""],
    choices: [
      { text: "Clear everything and focus.", playerLine: "Understood. I'll prioritize this.", effects: { boss: 8, reputation: 8, energy: -12, mood: -4 }, flags: ["deadline_full_focus"], feedback: "You clear other plans and put everything into the proposal.", memory: "You gave the deadline task your full day." },
      { text: "Ask for the key priority first.", playerLine: "I can do it. Which section matters most for the client decision?", effects: { boss: 6, reputation: 7, energy: -6, mood: 1 }, flags: ["deadline_clarified"], feedback: "Mr. Zhang gives clearer direction. You start slower, but avoid a big rework.", memory: "You clarified the deadline priority before working." },
      { text: "Say you may not finish.", playerLine: "I may not be able to finish by 6.", effects: { boss: -8, reputation: -5, mood: -2 }, flags: ["deadline_refused"], feedback: "Mr. Zhang replies, \"Got it.\" The message is colder than usual.", memory: "You warned Mr. Zhang you might miss the deadline." }
    ]
  },
  {
    id: "d5_emma",
    day: 5,
    slot: "Afternoon",
    type: "wechat",
    contact: "Emma",
    avatar: "emma",
    place: "wechat",
    summary: "Emma sends a new message.",
    incoming: [
      { from: "emma", text: "Hey, are you free for coffee sometime?", time: "15:40" }
    ],
    choices: [
      { text: "Reply warmly.", playerLine: "I'd like that. This week was intense, but coffee sounds nice.", effects: { friend: 4, mood: 5 }, flags: ["romance_route_unlocked"], feedbackLine: "Then rest first. Coffee when you're alive again.", feedback: "Emma replies quickly. A new relationship line opens.", memory: "You opened a new connection with Emma." },
      { text: "Postpone gently.", playerLine: "This week is a lot. Can I reply properly after the deadline?", effects: { mood: 1 }, flags: ["emma_postponed"], feedbackLine: "No worries. Rest first.", feedback: "The connection stays open.", memory: "You postponed Emma's invitation gently." },
      { text: "Keep it distant.", playerLine: "I'm busy lately, sorry.", effects: { friend: -2 }, flags: ["emma_distant"], feedbackLine: "No problem.", feedback: "Her tone stays polite, but there is distance.", memory: "You kept Emma at a distance." }
    ]
  },
  {
    id: "d5_team",
    day: 5,
    slot: "Evening",
    type: "scene",
    place: "restaurant",
    location: "Restaurant",
    title: "Final Team Meal",
    npc: "xiaoli",
    map: "restaurant",
    summary: "The team is going out after work.",
    body: ["Xiao Li messages from across the office: \"Last dinner this week. You coming?\""],
    choices: [
      { text: "Go with the team.", playerLine: "I'll come. Save me a seat.", effects: { coworker: 10, money: -50, energy: -5, mood: 3 }, flags: ["final_team_meal"], feedback: "When you arrive, people joke that they finally waited for you. You feel a little accepted.", memory: "You joined the final team meal." },
      { text: "Promise next time.", playerLine: "I can't tonight, but I mean it next time.", effects: { coworker: 2 }, flags: ["promised_future_team_event"], feedback: "Xiao Li replies, \"You better mean it.\"", memory: "You promised Xiao Li you would show up next time." },
      { text: "Decline coldly.", playerLine: "No. I need rest.", effects: { coworker: -8, mood: 1 }, flags: ["final_team_declined"], feedback: "Xiao Li only replies, \"Oh, okay.\" The chat ends too fast.", memory: "You declined the final team meal sharply." }
    ]
  },
  {
    id: "d5_family_birthday",
    day: 5,
    slot: "Night",
    type: "wechat",
    contact: "Mom",
    avatar: "mom",
    place: "wechat",
    summary: "Mom reminds you about a family birthday.",
    incoming: [
      { from: "mom", text: "Don't forget your uncle's birthday tomorrow.", time: "21:35" }
    ],
    choices: [
      { text: "Thank her and prepare a message.", playerLine: "Thanks for reminding me. I'll send a message tonight so I don't forget.", effects: { family: 8, mood: 2 }, flags: ["remembered_family_birthday"], feedbackLine: "Good. He'll be happy.", feedback: "Mom sounds relieved.", memory: "You handled the family birthday before it became a problem." },
      { text: "Say you will remember.", playerLine: "Got it. I'll remember.", effects: { family: 2 }, flags: ["birthday_acknowledged"], feedbackLine: "Better than forgetting.", feedback: "Mom accepts it, but does not sound fully convinced.", memory: "You acknowledged the birthday reminder." },
      { text: "Forget to reply.", playerLine: "...", effects: { family: -8, mood: -2 }, flags: ["forgot_family_birthday"], feedbackLine: "No reply.", feedback: "Tomorrow morning, this will not look good.", memory: "You missed Mom's birthday reminder." }
    ]
  }
];

const contacts = {
  Mom: { avatar: "mom", last: "Don't forget to eat breakfast.", time: "08:30" },
  "Project Team": { avatar: "group", group: true, last: "Boss: Let's discuss it later.", time: "Yesterday" },
  "Family Group": { avatar: "group", group: true, last: "Auntie asked a question.", time: "Yesterday" },
  XiaoLi: { avatar: "xiaoli", name: "Xiao Li", last: "Lunch?", time: "12:10" },
  Akai: { avatar: "akai", name: "Akai", last: "You alive?", time: "20:20" },
  Cousin: { avatar: "cousin", name: "Cousin", last: "Want an intro?", time: "22:05" },
  Emma: { avatar: "emma", name: "Emma", last: "Coffee sometime?", time: "15:40" }
};

const slotOrder = { Morning: 1, Noon: 2, Afternoon: 3, Evening: 4, Night: 5 };
events.sort((a, b) => (a.day - b.day) || (slotOrder[a.slot] - slotOrder[b.slot]));
const contactKeys = ["Mom", "Project Team", "Family Group", "XiaoLi", "Akai", "Cousin", "Emma"];

function activeEvents() {
  return events.filter(event => event.day === state.day && !state.completed.has(event.id));
}

function activeEventForPlace(place) {
  return activeEvents().find(event => event.place === place && event.type !== "wechat");
}

function activeWechatEvents() {
  return activeEvents().filter(event => event.type === "wechat");
}

function getEventById(id) {
  return events.find(event => event.id === id);
}

function ensurePlayableDay() {
  while (state.day <= 5 && activeEvents().length === 0) {
    state.day += 1;
  }
}

function hasFlag(flag) {
  return state.flags.has(flag);
}

function hasStat(key, threshold) {
  return state.stats[key] >= threshold;
}

function clampStats() {
  for (const key of Object.keys(state.stats)) {
    if (key === "money") continue;
    state.stats[key] = Math.max(0, Math.min(100, state.stats[key]));
  }
}

function outcomeSummary(effects = {}) {
  const labels = {
    boss: "Mr. Zhang's impression of Alex",
    coworker: "Coworkers' impression of Alex",
    family: "Family closeness",
    friend: "Friendship",
    reputation: "Workplace reputation",
    energy: "Energy",
    mood: "Mood",
    money: "Money"
  };
  const changes = Object.entries(effects)
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => {
      const label = labels[key] || key;
      if (key === "money") return `${label} ${value > 0 ? "increased" : "decreased"}`;
      return `${label} ${value > 0 ? "improved" : "dropped"}`;
    });
  return changes.length ? changes.join(". ") + "." : "No major visible result changed.";
}

function applyEffects(choice) {
  Object.entries(choice.effects || {}).forEach(([key, value]) => {
    state.stats[key] += value;
  });
  (choice.flags || []).forEach(flag => state.flags.add(flag));
  state.memories.unshift(outcomeSummary(choice.effects));
  clampStats();
}

function relationLabel(key, value) {
  const bands = {
    boss: [["Cold", 20], ["Barely Knows You", 40], ["Watching You", 60], ["Trusting You", 80], ["Mentor", 100]],
    coworker: [["Awkward", 20], ["Polite", 40], ["Friendly", 60], ["Office Friend", 80], ["Trusted Ally", 100]],
    family: [["Worried", 30], ["Distant", 60], ["Supportive", 80], ["Emotional Anchor", 100]],
    friend: [["Drifting Apart", 30], ["Normal", 60], ["Close", 80], ["Best Friend", 100]],
    reputation: [["New Face", 40], ["Reliable", 60], ["Noticed", 80], ["Respected", 100]]
  };
  return bands[key].find(([, max]) => value <= max)[0];
}

function render() {
  const dayBefore = state.day;
  ensurePlayableDay();
  if (state.day > 5) return showEnding();
  if (state.day !== dayBefore && state.day !== state.lastShownDay) {
    showDayBanner(state.day);
    state.lastShownDay = state.day;
  }
  const active = activeEvents();
  const firstEvent = active[0];
  document.getElementById("dayLabel").textContent = `Day ${state.day} - ${dayNames[state.day]}`;
  document.getElementById("slotLabel").textContent = `${active.length} Active Events`;
  document.getElementById("moneyValue").textContent = `¥${state.stats.money}`;
  document.getElementById("energyValue").textContent = `${state.stats.energy}/100`;
  document.getElementById("moodValue").textContent = `${state.stats.mood}/100`;
  document.getElementById("energyMeter").style.width = `${state.stats.energy}%`;
  document.getElementById("moodMeter").style.width = `${state.stats.mood}%`;
  document.getElementById("locationLabel").textContent = "Choose a Red Dot";
  document.getElementById("hintBar").textContent = `Day ${state.day}: ${active.length} active event${active.length === 1 ? "" : "s"} today. Check the marked areas.`;
  renderRelationships();
  renderMapButtons();
  renderWechat();
  renderEventList();
  renderMemory();
}

function renderRelationships() {
  const rels = [
    ["boss", "Boss", "boss"],
    ["coworker", "Coworker", "xiaoli"],
    ["family", "Family", "mom"],
    ["friend", "Friend", "akai"],
    ["reputation", "Reputation", "boss"]
  ];
  document.getElementById("relationships").innerHTML = rels.map(([key, label, avatar]) => {
    const value = state.stats[key];
    const active = Math.max(1, Math.ceil(value / 17));
    const familyClass = key === "family" ? " family" : key === "reputation" ? " reputation" : "";
    return `
      <div class="relationshipRow">
        <img src="${assets.characters[avatar]}" alt="">
        <div class="relationshipMeta">
          <div class="relationshipName"><b>${label}</b><span>${relationLabel(key, value)}</span></div>
          <div class="dots${familyClass}">${Array.from({ length: 6 }, (_, i) => `<i class="${i < active ? "on" : ""}"></i>`).join("")}</div>
        </div>
      </div>`;
  }).join("");
}

function renderMapButtons() {
  const html = Object.entries(places).map(([key, place]) => {
    const active = Boolean(activeEventForPlace(key));
    return `
      <button class="mapButton" style="left:${place.x}%;top:${place.y}%;" type="button" data-place="${key}">
        <span class="placeLabel">${place.label}${active ? '<i class="redDot">!</i>' : ""}</span>
        <span class="bluePin"></span>
      </button>`;
  }).join("");
  document.getElementById("mapButtons").innerHTML = html;
  document.querySelectorAll(".mapButton").forEach(button => {
    button.addEventListener("click", () => {
      const place = button.dataset.place;
      const event = activeEventForPlace(place);
      if (event) openEvent(event);
      else flashHint(`No major event at ${places[place].label} right now.`);
    });
  });
}

function renderWechat() {
  const wechatEvents = activeWechatEvents();
  const html = contactKeys.map(key => {
    const base = contacts[key];
    const name = base.name || key;
    const event = wechatEvents.find(item => item.contact === name);
    const isActive = Boolean(event);
    const avatarHtml = base.group ? `<span class="groupIcon">GROUP</span>` : `<img src="${assets.characters[base.avatar]}" alt="">`;
    const last = isActive ? event.incoming[event.incoming.length - 1].text : base.last;
    const time = isActive ? event.incoming[event.incoming.length - 1].time : base.time;
    return `
      <button class="wechatItem" type="button" data-contact="${name}">
        ${avatarHtml}
        <span><b>${name}</b><small>${last}</small></span>
        ${isActive ? '<span class="wechatUnread">1</span>' : `<small>${time}</small>`}
      </button>`;
  }).join("");
  document.getElementById("wechatList").innerHTML = html;
  const badge = document.getElementById("wechatBadge");
  badge.style.display = wechatEvents.length ? "grid" : "none";
  badge.textContent = String(wechatEvents.length);
  document.querySelectorAll(".wechatItem").forEach(item => {
    item.addEventListener("click", () => {
      openWechatInbox();
    });
  });
  document.getElementById("openWechatButton").onclick = () => {
    openWechatInbox();
  };
}

function renderEventList() {
  document.getElementById("eventList").innerHTML = activeEvents().map(event => {
    const iconClass = event.type === "wechat" ? "blue" : "";
    const vagueText = event.type === "wechat"
      ? "There may be something in WeChat."
      : `Something may happen at ${places[event.place]?.label}.`;
    return `
      <div class="eventItem">
        <span class="eventBang ${iconClass}">${event.type === "wechat" ? "•" : "!"}</span>
        <span><b>${vagueText}</b><small>${event.type === "wechat" ? "Check WeChat." : `Go to ${places[event.place]?.label}.`}</small></span>
      </div>`;
  }).join("");
}

function renderMemory() {
  const memory = document.getElementById("memoryPreview");
  if (!state.memories.length) {
    memory.textContent = "Results will appear here after choices.";
    return;
  }
  memory.innerHTML = state.memories.map(item => `<div class="memoryEntry">${item}</div>`).join("");
}

function flashHint(text) {
  const hint = document.getElementById("hintBar");
  const old = hint.textContent;
  hint.textContent = text;
  window.setTimeout(() => { hint.textContent = old; }, 1600);
}

function showDayBanner(day) {
  const banner = document.getElementById("dayBanner");
  banner.textContent = `Day ${day}`;
  banner.classList.remove("show");
  void banner.offsetWidth;
  banner.classList.add("show");
  window.setTimeout(() => banner.classList.remove("show"), 3000);
}

function openEvent(event) {
  state.openEventId = event.id;
  if (event.type === "wechat") openWechatEvent(event);
  else openSceneEvent(event);
}

function openWechatInbox() {
  const wechatEvents = activeWechatEvents();
  const html = contactKeys.map(key => {
    const base = contacts[key];
    const name = base.name || key;
    const event = wechatEvents.find(item => item.contact === name);
    const isActive = Boolean(event);
    const avatarHtml = base.group ? `<span class="groupIcon">GROUP</span>` : `<img src="${assets.characters[base.avatar]}" alt="">`;
    const last = isActive ? event.incoming[event.incoming.length - 1].text : base.last;
    const time = isActive ? event.incoming[event.incoming.length - 1].time : base.time;
    return `
      <button class="wechatInboxItem" type="button" data-contact="${name}">
        ${avatarHtml}
        <span><b>${name}</b><small>${last}</small></span>
        <span>${isActive ? '<span class="wechatUnread">1</span>' : `<small>${time}</small>`}</span>
      </button>`;
  }).join("");
  showModal(`
    <div class="wechatInbox">
      <div class="wechatInboxHeader">
        <span class="wechatLogo">WX</span>
        <h2 id="modalTitle">WeChat</h2>
        <button class="closeButton" type="button">Close</button>
      </div>
      <div class="wechatInboxList">${html}</div>
    </div>`);
  document.querySelector(".closeButton").addEventListener("click", closeModal);
  document.querySelectorAll(".wechatInboxItem").forEach(item => {
    item.addEventListener("click", () => {
      const event = activeWechatEvents().find(active => active.contact === item.dataset.contact);
      if (event) openEvent(event);
      else flashHint(`${item.dataset.contact} has no new playable message right now.`);
    });
  });
}

function openSceneEvent(event) {
  const intro = typeof event.intro === "function" ? event.intro() : "";
  const body = [intro, ...(event.body || [])].filter(Boolean);
  showModal(`
    <div class="sceneView">
      <div class="sceneArt">
        <img class="bg" src="${assets.maps[event.map]}" alt="">
        <img class="sceneCharacter player" src="${assets.characters.player}" alt="">
        ${event.npc && event.npc !== "player" ? `<img class="sceneCharacter npc" src="${assets.characters[event.npc]}" alt="">` : ""}
      </div>
      <div class="dialogPanel">
        <h2 id="modalTitle">${event.title}</h2>
        <p class="meta">${event.slot} - ${event.location}</p>
        <div class="dialogueText">${body.map(p => `<p>${p}</p>`).join("")}</div>
        <div class="choiceList">${event.choices.map((choice, index) => `<button class="choiceButton" type="button" data-choice="${index}">${choice.text}</button>`).join("")}</div>
      </div>
    </div>`);
  bindChoiceButtons(event, "scene");
}

function openWechatEvent(event) {
  const headerAvatar = event.group ? `<span class="groupIcon">GROUP</span>` : `<img src="${assets.characters[event.avatar]}" alt="">`;
  const incoming = event.incoming.map(msg => chatLine(msg.from, msg.text, msg.time, false)).join("");
  showModal(`
    <div class="wechatChat">
      <div class="chatHeader">
        <button class="backGlyph" type="button" aria-label="Close">‹</button>
        ${headerAvatar}
        <h2 id="modalTitle">${event.contact}</h2>
      </div>
      <div class="chatBody" id="chatBody">${incoming}</div>
      <div class="chatChoices">${event.choices.map((choice, index) => `<button class="choiceButton" type="button" data-choice="${index}">${choice.text}</button>`).join("")}</div>
    </div>`);
  document.querySelector(".backGlyph").addEventListener("click", closeModal);
  bindChoiceButtons(event, "wechat");
}

function chatLine(from, text, time, isPlayer) {
  const avatar = isPlayer ? assets.characters.player : assets.characters[from] || assets.characters.mom;
  return `
    <div class="chatLine ${isPlayer ? "player" : ""}">
      ${isPlayer ? `<span class="chatTime">${time}</span><div class="bubble">${text}</div><img class="chatAvatar" src="${avatar}" alt="">` : `<img class="chatAvatar" src="${avatar}" alt=""><div class="bubble">${text}</div><span class="chatTime">${time}</span>`}
    </div>`;
}

function bindChoiceButtons(event, mode) {
  document.querySelectorAll("[data-choice]").forEach(button => {
    button.addEventListener("click", () => {
      const choice = event.choices[Number(button.dataset.choice)];
      applyEffects(choice);
      if (mode === "wechat") showWechatFeedback(event, choice);
      else showSceneFeedback(event, choice);
    });
  });
}

function showSceneFeedback(event, choice) {
  const modal = document.getElementById("sceneModal");
  modal.querySelector(".dialogueText").innerHTML = `
    <p><b>You:</b> ${choice.playerLine}</p>
    <p>${choice.feedback}</p>
    <p><b>Result:</b> ${outcomeSummary(choice.effects)}</p>`;
  modal.querySelector(".choiceList").innerHTML = `<button class="continueButton" type="button">Continue</button>`;
  modal.querySelector(".continueButton").addEventListener("click", completeEvent);
}

function showWechatFeedback(event, choice) {
  const chatBody = document.getElementById("chatBody");
  const now = event.incoming[event.incoming.length - 1]?.time || "Now";
  chatBody.insertAdjacentHTML("beforeend", chatLine("player", choice.playerLine, now, true));
  if (choice.feedbackLine && choice.playerLine !== "...") {
    const responder = event.group ? (event.contact === "Family Group" ? "mom" : "xiaoli") : event.avatar;
    chatBody.insertAdjacentHTML("beforeend", chatLine(responder, choice.feedbackLine, "Now", false));
  } else if (choice.feedbackLine) {
    const responder = event.group ? "mom" : event.avatar;
    chatBody.insertAdjacentHTML("beforeend", chatLine(responder, choice.feedbackLine, "Now", false));
  }
  document.querySelector(".chatChoices").innerHTML = `
    <p class="memoryPreview">${choice.feedback}<br><b>Result:</b> ${outcomeSummary(choice.effects)}</p>
    <button class="continueButton" type="button">Continue</button>`;
  chatBody.scrollTop = chatBody.scrollHeight;
  document.querySelector(".continueButton").addEventListener("click", completeEvent);
}

function completeEvent() {
  if (state.openEventId) state.completed.add(state.openEventId);
  state.openEventId = null;
  closeModal();
  render();
}

function showModal(html) {
  const backdrop = document.getElementById("modalBackdrop");
  const modal = document.getElementById("sceneModal");
  modal.innerHTML = html;
  backdrop.hidden = false;
}

function closeModal() {
  document.getElementById("modalBackdrop").hidden = true;
}

function showEnding() {
  let title = "Balanced Survivor";
  let text = "You made it through the first week with some relationships intact and some still uncertain. No one can be satisfied all the time, and that is the point.";
  if (state.stats.reputation >= 52 && state.stats.boss >= 50 && state.stats.energy < 35) {
    title = "Workplace Rising Star";
    text = "Mr. Zhang remembers your work, and your name has started to circulate. The cost is visible: your energy is running low.";
  } else if (state.stats.coworker >= 55) {
    title = "Social Connector";
    text = "You did not just survive the office. You slowly became someone people include.";
  } else if (state.stats.family >= 78) {
    title = "Family Anchor";
    text = "Work pulled hard, but you kept family close enough that home still feels reachable.";
  } else if (state.stats.boss < 30 || state.stats.coworker < 30) {
    title = "Office Ghost";
    text = "You completed the week, but people still seem unsure where to place you.";
  }
  showModal(`
    <div class="endingCard">
      <h2 id="modalTitle">${title}</h2>
      <p>${text}</p>
      <p><b>Memories collected:</b> ${state.memories.length}</p>
      <button class="continueButton" type="button" id="endingRestart">Play Again</button>
    </div>`);
  document.getElementById("endingRestart").addEventListener("click", restart);
}

function restart() {
  state.day = 1;
  state.openEventId = null;
  state.lastShownDay = 1;
  state.stats = { ...initialStats };
  state.flags = new Set();
  state.memories = [];
  state.completed = new Set();
  closeModal();
  render();
}

document.getElementById("restartButton").addEventListener("click", restart);
document.getElementById("memoryButton").addEventListener("click", () => {
  showModal(`
    <div class="endingCard">
      <h2 id="modalTitle">Memory Log</h2>
      ${(state.memories.length ? state.memories : ["No results recorded yet."]).map(item => `<p>${item}</p>`).join("")}
      <button class="closeButton" type="button">Close</button>
    </div>`);
  document.querySelector(".closeButton").addEventListener("click", closeModal);
});
document.getElementById("modalBackdrop").addEventListener("click", event => {
  if (event.target.id === "modalBackdrop") closeModal();
});

render();
