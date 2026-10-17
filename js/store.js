// In-memory & LocalStorage reactive store for HostelHub
const STORAGE_KEY = "hostelhub:v2";

/** Seed Data Generation with realistic edge cases **/
function createSeedData() {
  const blocks = ["A", "B", "C", "D"];
  const roomTypes = ["Single", "Double", "Triple"];
  const capacities = { Single: 1, Double: 2, Triple: 3 };

  // 1. Generate 60 Rooms across 4 blocks & 3 floors
  const rooms = [];
  blocks.forEach(block => {
    for (let floor = 1; floor <= 3; floor++) {
      for (let num = 1; num <= 5; num++) {
        const roomNum = `${floor}0${num}`;
        const type = num === 1 ? "Single" : num <= 3 ? "Double" : "Triple";
        rooms.push({
          id: `room-${block}-${roomNum}`,
          block: block,
          floor: floor,
          number: roomNum,
          type: type,
          capacity: capacities[type],
          occupants: [],
          status: "available" // available | partial | full | maintenance
        });
      }
    }
  });

  // 2. 40 Realistic Students (including a long name for overflow edge-case testing)
  const firstNames = [
    "Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Sneha", "Karan", "Ishita", "Aditya", "Neha", 
    "Arjun", "Tanvi", "Rahul", "Meera", "Kabir", "Riya", "Dhruv", "Pooja", "Siddharth", "Kavya",
    "Harsh", "Divya", "Dev", "Shreya", "Aryan", "Nandini", "Yash", "Simran", "Varun", "Ritika",
    "Akash", "Zara", "Manish", "Tara", "Samar", "Bhavya", "Nikhil", "Diya", "Gaurav", 
    "Shrimant Shrimantrao" // Realistically long name to test overflow & typography
  ];
  const lastNames = [
    "Sharma", "Patel", "Verma", "Rao", "Gupta", "Nair", "Mehta", "Singh", "Joshi", "Iyer",
    "Reddy", "Chopra", "Das", "Kapoor", "Bose", "Menon", "Malhotra", "Saxena", "Sen", "Patwardhan"
  ];
  const courses = ["B.Tech CS", "B.Tech AI&DS", "B.Tech ECE", "B.Arch", "BBA", "B.Sc Data Science", "MBA Tech"];

  const students = [];
  for (let i = 0; i < 40; i++) {
    const fName = firstNames[i];
    const lName = lastNames[i % lastNames.length];
    const id = `std-${1000 + i}`;
    const rollNo = `23BCSE${String(101 + i).padStart(3, "0")}`;
    const gender = ["Priya", "Ananya", "Sneha", "Ishita", "Neha", "Tanvi", "Meera", "Riya", "Pooja", "Kavya", "Divya", "Shreya", "Nandini", "Simran", "Ritika", "Zara", "Tara", "Bhavya", "Diya"].includes(fName) ? "women" : "men";
    students.push({
      id: id,
      name: `${fName} ${lName}`,
      rollNo: rollNo,
      email: `${fName.toLowerCase().replace(/ /g, '.')}.${lName.toLowerCase()}@hostelhub.edu`,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      course: courses[i % courses.length],
      year: (i % 4) + 1,
      roomId: null,
      avatar: `https://images.unsplash.com/photo-${gender === 'women' ? '1534528741775-53994a69daeb' : '1539571696357-5a69c17a67c6'}?w=150&auto=format&fit=crop&q=80`,
      status: "active"
    });
  }

  // Pre-allocate ~32 students into rooms
  let studentIdx = 0;
  // Fill first 6 rooms completely
  for (let r = 0; r < 6 && studentIdx < students.length; r++) {
    const room = rooms[r];
    while (room.occupants.length < room.capacity && studentIdx < students.length) {
      const s = students[studentIdx++];
      s.roomId = room.id;
      room.occupants.push(s.id);
    }
    room.status = "full";
  }
  // Partially fill next 12 rooms
  for (let r = 6; r < 18 && studentIdx < 34; r++) {
    const room = rooms[r];
    if (room.capacity > 1) {
      const s = students[studentIdx++];
      s.roomId = room.id;
      room.occupants.push(s.id);
      room.status = room.occupants.length === room.capacity ? "full" : "partial";
    }
  }
  // Room in maintenance
  rooms[25].status = "maintenance";

  // 3. Allocations history
  const allocations = [];
  students.filter(s => s.roomId).forEach((s, idx) => {
    allocations.push({
      id: `alloc-${idx + 1}`,
      studentId: s.id,
      roomId: s.roomId,
      checkIn: "2026-08-01",
      status: "active"
    });
  });

  // 4. Service & Complaint Requests (Includes overdue task & priority variety)
  const serviceRequests = [
    {
      id: "req-101",
      studentId: students[0].id,
      roomId: students[0].roomId || "room-A-101",
      type: "cleaning",
      category: "Room Deep Clean",
      title: "Routine dusting & floor mopping",
      description: "Bathroom scrub and bedroom floor wipe-down before weekend study session.",
      preferredSlot: "10:00 - 12:00",
      priority: "low",
      status: "pending",
      isOverdue: false,
      assignee: null,
      createdAt: "2026-10-17 09:30",
      timeline: [
        { status: "pending", at: "2026-10-17 09:30", note: "Housekeeping request filed by resident" }
      ]
    },
    {
      id: "req-102",
      studentId: students[1].id,
      roomId: students[1].roomId || "room-A-102",
      type: "maintenance",
      category: "Air Conditioner",
      title: "AC cooling coil frosting & loud vibration",
      description: "Split unit trips breaker after running for 25 minutes.",
      preferredSlot: "Immediate",
      priority: "high",
      status: "in-progress",
      isOverdue: false,
      assignee: "Suresh (HVAC Tech)",
      createdAt: "2026-10-16 14:10",
      timeline: [
        { status: "pending", at: "2026-10-16 14:10", note: "Ticket opened" },
        { status: "assigned", at: "2026-10-16 15:00", note: "Assigned to Suresh (HVAC Tech)" },
        { status: "in-progress", at: "2026-10-17 10:00", note: "Compressor capacitor replacement underway" }
      ]
    },
    {
      id: "req-103",
      studentId: students[2].id,
      roomId: students[2].roomId || "room-A-103",
      type: "maintenance",
      category: "Electrical",
      title: "Desk switchboard loose contact & sparking",
      description: "Master rocker switch on study desk 2 sparks when toggled.",
      preferredSlot: "Morning",
      priority: "urgent",
      status: "assigned",
      isOverdue: false,
      assignee: "Ramesh (Electrician)",
      createdAt: "2026-10-17 08:00",
      timeline: [
        { status: "pending", at: "2026-10-17 08:00", note: "Urgent electrical issue filed" },
        { status: "assigned", at: "2026-10-17 08:45", note: "Assigned to Ramesh" }
      ]
    },
    {
      id: "req-104",
      studentId: students[3].id,
      roomId: students[3].roomId || "room-A-104",
      type: "cleaning",
      category: "Restroom Sanitization",
      title: "Weekly bathroom scrub & drain clearance",
      description: "Shower drain water flows slowly. Please unclog and sanitize.",
      preferredSlot: "14:00 - 16:00",
      priority: "medium",
      status: "resolved",
      isOverdue: false,
      assignee: "Sunita (Housekeeping)",
      createdAt: "2026-10-15 11:20",
      timeline: [
        { status: "pending", at: "2026-10-15 11:20", note: "Request submitted" },
        { status: "assigned", at: "2026-10-15 13:00", note: "Assigned to Sunita" },
        { status: "in-progress", at: "2026-10-15 14:30", note: "Drain cleared with auger" },
        { status: "resolved", at: "2026-10-15 15:45", note: "Signed off by floor supervisor" }
      ]
    },
    {
      id: "req-105",
      studentId: students[4].id,
      roomId: students[4].roomId || "room-B-101",
      type: "maintenance",
      category: "Plumbing",
      title: "Washbasin tap valve leaking continuously",
      description: "Worn gasket causing persistent drip and water wastage.",
      preferredSlot: "Morning",
      priority: "medium",
      status: "pending",
      isOverdue: true, // OVERDUE TASK (> 48h) to test warden alerts
      assignee: null,
      createdAt: "2026-10-14 07:15",
      timeline: [
        { status: "pending", at: "2026-10-14 07:15", note: "Submitted via resident portal (Overdue for assignment)" }
      ]
    },
    {
      id: "req-106",
      studentId: students[5].id,
      roomId: students[5].roomId || "room-B-102",
      type: "cleaning",
      category: "Balcony & Window Cleaning",
      title: "Balcony dust screen washing",
      description: "Exterior dust storm left residue on window mesh.",
      preferredSlot: "Afternoon",
      priority: "low",
      status: "in-progress",
      isOverdue: false,
      assignee: "Manoj (Housekeeping)",
      createdAt: "2026-10-16 16:40",
      timeline: [
        { status: "pending", at: "2026-10-16 16:40", note: "Request created" },
        { status: "assigned", at: "2026-10-17 09:00", note: "Assigned to Manoj" },
        { status: "in-progress", at: "2026-10-17 09:30", note: "Balcony cleaning underway" }
      ]
    },
    {
      id: "req-107",
      studentId: students[6].id,
      roomId: students[6].roomId || "room-B-103",
      type: "maintenance",
      category: "Carpentry",
      title: "Wardrobe hydraulic hinge misaligned",
      description: "Wardrobe door loose and does not latch properly.",
      preferredSlot: "16:00 - 18:00",
      priority: "medium",
      status: "resolved",
      isOverdue: false,
      assignee: "Jagdish (Carpenter)",
      createdAt: "2026-10-14 10:00",
      timeline: [
        { status: "pending", at: "2026-10-14 10:00", note: "Reported" },
        { status: "assigned", at: "2026-10-14 12:30", note: "Assigned to Jagdish" },
        { status: "in-progress", at: "2026-10-14 16:00", note: "Replaced 2 hydraulic hinges" },
        { status: "resolved", at: "2026-10-14 16:45", note: "Fixed and inspected" }
      ]
    },
    {
      id: "req-108",
      studentId: students[7].id,
      roomId: students[7].roomId || "room-B-104",
      type: "maintenance",
      category: "Network / Wi-Fi",
      title: "Ethernet wall port link down",
      description: "RJ-45 jack contacts oxidized; no packet link detected.",
      preferredSlot: "Morning",
      priority: "high",
      status: "assigned",
      isOverdue: false,
      assignee: "Dev (IT Admin)",
      createdAt: "2026-10-16 19:20",
      timeline: [
        { status: "pending", at: "2026-10-16 19:20", note: "Ticket created" },
        { status: "assigned", at: "2026-10-17 08:30", note: "Assigned to Dev (IT)" }
      ]
    }
  ];

  // 5. Amenities & Facilities (Realistic capacities, hours, full slots, and closed facility)
  const amenities = [
    {
      id: "amenity-gym",
      name: "Fitness Center & Gym",
      location: "Block D, Ground Floor",
      hours: "06:00 - 22:00",
      capacity: 25,
      currentOccupancy: 18,
      status: "open", // open | maintenance
      slots: ["06:00 - 08:00", "08:00 - 10:00", "16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"],
      bookings: [
        { id: "bk-101", studentId: "std-1000", studentName: "Aarav Sharma", slot: "18:00 - 20:00", date: "2026-10-17", status: "confirmed" },
        { id: "bk-102", studentId: "std-1001", studentName: "Priya Patel", slot: "18:00 - 20:00", date: "2026-10-17", status: "confirmed" }
      ]
    },
    {
      id: "amenity-pool",
      name: "Swimming Pool",
      location: "Sports Quadrangle",
      hours: "06:30 - 20:00",
      capacity: 15,
      currentOccupancy: 8,
      status: "open",
      slots: ["06:30 - 08:30", "16:00 - 18:00", "18:00 - 20:00"],
      bookings: [
        { id: "bk-103", studentId: "std-1002", studentName: "Rohan Verma", slot: "16:00 - 18:00", date: "2026-10-17", status: "confirmed" }
      ]
    },
    {
      id: "amenity-study",
      name: "Quiet Study Hall & Pods",
      location: "Block A, 1st Floor",
      hours: "24 Hours",
      capacity: 40,
      currentOccupancy: 28,
      status: "open",
      slots: ["Morning (08:00 - 12:00)", "Afternoon (12:00 - 16:00)", "Evening (16:00 - 20:00)", "Night (20:00 - 00:00)"],
      bookings: [
        { id: "bk-104", studentId: "std-1000", studentName: "Aarav Sharma", slot: "Evening (16:00 - 20:00)", date: "2026-10-17", status: "confirmed" }
      ]
    },
    {
      id: "amenity-badminton",
      name: "Badminton Court",
      location: "Indoor Sports Hub",
      hours: "06:00 - 21:00",
      capacity: 8,
      currentOccupancy: 8, // FULL capacity slot
      status: "open",
      slots: ["06:00 - 08:00", "08:00 - 10:00", "16:00 - 18:00", "18:00 - 20:00"],
      bookings: [
        { id: "bk-105", studentId: "std-1004", studentName: "Vikram Gupta", slot: "18:00 - 20:00", date: "2026-10-17", status: "confirmed" }
      ]
    },
    {
      id: "amenity-squash",
      name: "Squash Court & Sauna",
      location: "Sports Quadrangle",
      hours: "07:00 - 20:00",
      capacity: 6,
      currentOccupancy: 0,
      status: "maintenance", // CLOSED FACILITY to exercise maintenance state
      slots: ["07:00 - 10:00", "16:00 - 20:00"],
      bookings: []
    },
    {
      id: "amenity-parking",
      name: "Resident & Visitor Parking",
      location: "North Gate Quadrangle",
      hours: "08:00 - 22:00",
      capacity: 12,
      currentOccupancy: 12, // FULL SLOTS
      status: "open",
      slots: ["Day Slot (08:00 - 20:00)", "Overnight (20:00 - 08:00)"],
      bookings: [
        { id: "bk-106", studentId: "std-1003", studentName: "Ananya Rao", slot: "Day Slot (08:00 - 20:00)", date: "2026-10-17", status: "confirmed" }
      ]
    }
  ];

  // 6. Weekly Mess Menu
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const messMenu = [
    {
      day: "Monday",
      timings: { breakfast: "07:30 - 09:30", lunch: "12:30 - 14:30", snacks: "16:30 - 18:00", dinner: "19:30 - 21:30" },
      meals: {
        breakfast: ["Masala Dosa with Sambar", "Coconut Chutney", "Boiled Eggs / Sprouts", "Masala Chai & Coffee"],
        lunch: ["Paneer Butter Masala", "Dal Makhani", "Steamed Jeera Rice", "Butter Roti", "Cucumber Raita"],
        snacks: ["Samosa with Mint Chutney", "Adrak Tea"],
        dinner: ["Kadai Vegetable Medley", "Yellow Moong Dal Tadka", "Phulka Roti", "Pulao Rice", "Fruit Custard"]
      }
    },
    {
      day: "Tuesday",
      timings: { breakfast: "07:30 - 09:30", lunch: "12:30 - 14:30", snacks: "16:30 - 18:00", dinner: "19:30 - 21:30" },
      meals: {
        breakfast: ["Poha with Peanuts & Sev", "Aloo Paratha with Curd", "Boiled Eggs", "Filter Coffee"],
        lunch: ["Rajma Masala", "Aloo Gobhi Adraki", "Basmati Rice", "Tawa Roti", "Boondi Raita"],
        snacks: ["Veg Cutlet with Chutney", "Hot Coffee"],
        dinner: ["Methi Malai Matar", "Chana Dal Fry", "Laccha Paratha", "Steamed Rice", "Kheer"]
      }
    },
    {
      day: "Wednesday",
      timings: { breakfast: "07:30 - 09:30", lunch: "12:30 - 14:30", snacks: "16:30 - 18:00", dinner: "19:30 - 21:30" },
      meals: {
        breakfast: ["Idli Vada Combo", "Tomato Chutney & Sambar", "Fresh Milk", "Oatmeal"],
        lunch: ["Chole Bhature", "Jeera Aloo", "Biryani Rice", "Sweet Lassi"],
        snacks: ["Pav Bhaji", "Masala Chai"],
        dinner: ["Shahi Mushroom / Paneer Curry", "Dal Tadka", "Chapati", "Jeera Rice", "Ice Cream"]
      }
    },
    {
      day: "Thursday",
      timings: { breakfast: "07:30 - 09:30", lunch: "12:30 - 14:30", snacks: "16:30 - 18:00", dinner: "19:30 - 21:30" },
      meals: {
        breakfast: ["Vegetable Upma with Chutney", "Bread Butter Jam / Omelette", "Tea & Coffee"],
        lunch: ["Palak Paneer", "Dal Fry", "Steamed Rice", "Missi Roti", "Sprouts Salad"],
        snacks: ["Corn Chaat", "Ginger Lemon Tea"],
        dinner: ["Veg Kofta in Cream Gravy", "Panchratna Dal", "Phulka Roti", "Peas Pulao", "Rasgulla"]
      }
    },
    {
      day: "Friday",
      timings: { breakfast: "07:30 - 09:30", lunch: "12:30 - 14:30", snacks: "16:30 - 18:00", dinner: "19:30 - 21:30" },
      meals: {
        breakfast: ["Uttapam with Sambar", "Cereal & Warm Milk", "Boiled Egg", "Filter Coffee"],
        lunch: ["Dum Aloo Kashmiri", "Dal Tadka", "Fried Rice", "Tandoori Roti", "Mint Raita"],
        snacks: ["Veg Spring Rolls", "Sweet Corn Soup"],
        dinner: ["Hyderabadi Veg Biryani / Chicken Biryani", "Mirchi Ka Salan", "Burani Raita", "Shahi Tukda"]
      }
    },
    {
      day: "Saturday",
      timings: { breakfast: "08:00 - 10:00", lunch: "12:30 - 14:30", snacks: "16:30 - 18:00", dinner: "19:30 - 21:30" },
      meals: {
        breakfast: ["Poori Bhaji", "Sooji Halwa", "Omelette / Fruit Bowl", "Masala Tea"],
        lunch: ["Mix Vegetable Curry", "Kadhi Pakora", "Steamed Rice & Khichdi", "Ghee Roti", "Papad"],
        snacks: ["White Sauce Pasta", "Iced Lemon Tea"],
        dinner: ["Paneer Lababdar", "Dal Bukhara", "Garlic Naan & Phulka", "Jeera Rice", "Chocolate Brownie"]
      }
    },
    {
      day: "Sunday",
      timings: { breakfast: "08:00 - 10:30", lunch: "12:30 - 14:30", snacks: "16:30 - 18:00", dinner: "19:30 - 21:30" },
      meals: {
        breakfast: ["Club Sandwich", "Hash Browns", "Sunny Side Up / Fruit Platter", "Hot Chocolate"],
        lunch: ["Sunday Special Thali", "Malai Kofta", "Dal Maharani", "Kashmiri Pulao", "Butter Kulcha", "Kulfi"],
        snacks: ["Dhokla with Green Chilies", "Masala Chai"],
        dinner: ["Veg Jalfrezi", "Moong Dal Comfort Bowl", "Ghee & Pickle", "Phulka", "Gajar Halwa"]
      }
    }
  ];

  // 7. Meal Ratings
  const mealRatings = [
    { day: "Saturday", meal: "lunch", rating: 5, studentId: "std-1000" },
    { day: "Saturday", meal: "lunch", rating: 4, studentId: "std-1001" },
    { day: "Saturday", meal: "lunch", rating: 5, studentId: "std-1002" },
    { day: "Saturday", meal: "breakfast", rating: 5, studentId: "std-1000" }
  ];

  // 8. Announcements
  const announcements = [
    {
      id: "ann-1",
      title: "Hostel Cultural Night 'Echoes 2026' Auditions",
      body: "Calling all musicians, dancers, and artists. Auditions for the annual hostel night will be held in Block B Common Hall from 16:00 onwards. Register at the warden office.",
      category: "Events",
      pinned: true,
      createdAt: "2026-10-16 10:00",
      readBy: ["std-1000"]
    },
    {
      id: "ann-2",
      title: "High-Speed Wi-Fi Router Firmware Maintenance",
      body: "IT Services will upgrade core switches in Blocks A and C on Sunday between 02:00 and 04:00. Internet access will experience intermittent interruptions.",
      category: "Maintenance",
      pinned: true,
      createdAt: "2026-10-15 17:30",
      readBy: []
    },
    {
      id: "ann-3",
      title: "Monthly Open Mess Committee Review Session",
      body: "The open catering session with the hostel warden and food committee will take place Thursday in the Dining Hall at 18:30. Winter menu suggestions welcome.",
      category: "Dining",
      pinned: false,
      createdAt: "2026-10-14 12:00",
      readBy: ["std-1000", "std-1001"]
    },
    {
      id: "ann-4",
      title: "Fitness Center New Equipment Installation",
      body: "Two brand new elliptical trainers, Olympic barbells, and upgraded dumbbells are now available in the Block D Fitness Center.",
      category: "Facilities",
      pinned: false,
      createdAt: "2026-10-12 11:15",
      readBy: ["std-1000"]
    }
  ];

  // 9. App Settings & Density
  const settings = {
    theme: "light", // 'light' | 'dark' | 'system'
    density: "comfortable", // 'comfortable' (student) | 'compact' (warden)
    maintenanceMode: false,
    maintenanceBannerText: "Scheduled Campus Notice: Transformer inspection in progress across Block A & B today.",
    activeRole: "student", // default role: 'student' | 'admin'
    currentStudentId: "std-1000" // default logged-in student (Aarav Sharma)
  };

  return {
    students,
    rooms,
    allocations,
    serviceRequests,
    amenities,
    messMenu,
    mealRatings,
    announcements,
    settings
  };
}

class Store {
  constructor() {
    this.listeners = new Set();
    this.state = this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Verify key schema presence
        if (parsed && parsed.amenities && parsed.students && parsed.settings) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
    const seed = createSeedData();
    this.save(seed);
    return seed;
  }

  save(state = this.state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }

  reset() {
    const seed = createSeedData();
    this.state = seed;
    this.save(seed);
    this.notify();
    return seed;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  getState() {
    return this.state;
  }

  // --- Role & Appearance Settings ---

  setRole(role, studentId = null) {
    this.state.settings.activeRole = role;
    // Set appropriate density default per role
    this.state.settings.density = role === 'admin' ? 'compact' : 'comfortable';
    if (studentId) {
      this.state.settings.currentStudentId = studentId;
    }
    this.save();
    this.notify();
  }

  setTheme(theme) {
    this.state.settings.theme = theme;
    this.save();
    this.notify();
  }

  setDensity(density) {
    this.state.settings.density = density;
    this.save();
    this.notify();
  }

  toggleMaintenanceMode(bannerText) {
    this.state.settings.maintenanceMode = !this.state.settings.maintenanceMode;
    if (bannerText) {
      this.state.settings.maintenanceBannerText = bannerText;
    }
    this.save();
    this.notify();
  }

  // --- Student Actions ---

  createStudent(studentData) {
    const newStudent = {
      id: `std-${Date.now()}`,
      rollNo: studentData.rollNo || `23BCSE${Math.floor(200 + Math.random() * 800)}`,
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      course: studentData.course,
      year: parseInt(studentData.year) || 1,
      roomId: null,
      avatar: studentData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      status: "active"
    };
    this.state.students.unshift(newStudent);
    this.save();
    this.notify();
    return newStudent;
  }

  updateStudent(id, updates) {
    const idx = this.state.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.state.students[idx] = { ...this.state.students[idx], ...updates };
      this.save();
      this.notify();
    }
  }

  deleteStudent(id) {
    this.unassignStudent(id);
    this.state.students = this.state.students.filter(s => s.id !== id);
    this.save();
    this.notify();
  }

  // --- Pure Room Allocation (NO PRICING) ---

  assignStudentToRoom(studentId, roomId) {
    const room = this.state.rooms.find(r => r.id === roomId);
    const student = this.state.students.find(s => s.id === studentId);
    if (!room || !student) return false;

    if (room.occupants.length >= room.capacity) {
      throw new Error(`Room ${room.block}-${room.number} is already at full capacity (${room.capacity} beds).`);
    }

    if (student.roomId && student.roomId !== roomId) {
      this.unassignStudent(studentId);
    }

    if (!room.occupants.includes(studentId)) {
      room.occupants.push(studentId);
    }
    student.roomId = roomId;

    if (room.occupants.length >= room.capacity) {
      room.status = "full";
    } else if (room.occupants.length > 0) {
      room.status = "partial";
    } else {
      room.status = "available";
    }

    this.state.allocations.push({
      id: `alloc-${Date.now()}`,
      studentId: studentId,
      roomId: roomId,
      checkIn: new Date().toISOString().split("T")[0],
      status: "active"
    });

    this.save();
    this.notify();
    return true;
  }

  unassignStudent(studentId) {
    const student = this.state.students.find(s => s.id === studentId);
    if (!student || !student.roomId) return;

    const room = this.state.rooms.find(r => r.id === student.roomId);
    if (room) {
      room.occupants = room.occupants.filter(id => id !== studentId);
      if (room.occupants.length === 0) {
        room.status = "available";
      } else {
        room.status = "partial";
      }
    }

    student.roomId = null;

    this.state.allocations.forEach(a => {
      if (a.studentId === studentId && a.status === "active") {
        a.status = "past";
        a.checkOut = new Date().toISOString().split("T")[0];
      }
    });

    this.save();
    this.notify();
  }

  toggleRoomMaintenance(roomId) {
    const room = this.state.rooms.find(r => r.id === roomId);
    if (!room) return;
    if (room.status === "maintenance") {
      room.status = room.occupants.length >= room.capacity ? "full" : room.occupants.length > 0 ? "partial" : "available";
    } else {
      room.status = "maintenance";
    }
    this.save();
    this.notify();
  }

  // --- Service, Housekeeping & Maintenance Requests ---

  createServiceRequest({ studentId, roomId, type, category, title, description, priority, preferredSlot }) {
    const newReq = {
      id: `req-${Date.now()}`,
      studentId,
      roomId,
      type, // 'cleaning' | 'maintenance'
      category,
      title,
      description,
      priority: priority || "medium",
      preferredSlot: preferredSlot || "Anytime",
      status: "pending",
      isOverdue: false,
      assignee: null,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      timeline: [
        {
          status: "pending",
          at: new Date().toISOString().replace("T", " ").substring(0, 16),
          note: `Request filed by resident (${type})`
        }
      ]
    };
    this.state.serviceRequests.unshift(newReq);
    this.save();
    this.notify();
    return newReq;
  }

  updateServiceRequestStatus(id, newStatus, note = "", assignee = null) {
    const req = this.state.serviceRequests.find(r => r.id === id);
    if (!req) return;

    req.status = newStatus;
    if (assignee !== null) {
      req.assignee = assignee;
    }
    req.timeline.push({
      status: newStatus,
      at: new Date().toISOString().replace("T", " ").substring(0, 16),
      note: note || `Status updated to ${newStatus}${assignee ? ` (Staff: ${assignee})` : ''}`
    });

    this.save();
    this.notify();
  }

  assignServiceStaff(id, assigneeName) {
    const req = this.state.serviceRequests.find(r => r.id === id);
    if (!req) return;
    req.assignee = assigneeName;
    if (req.status === "pending") {
      req.status = "assigned";
    }
    req.timeline.push({
      status: req.status,
      at: new Date().toISOString().replace("T", " ").substring(0, 16),
      note: `Staff assigned: ${assigneeName}`
    });
    this.save();
    this.notify();
  }

  // --- Amenities & Facilities Management ---

  bookAmenity(amenityId, studentId, slot, date) {
    const amenity = this.state.amenities.find(a => a.id === amenityId);
    const student = this.state.students.find(s => s.id === studentId);
    if (!amenity || !student) throw new Error("Facility or student not found.");

    if (amenity.status === "maintenance") {
      throw new Error(`${amenity.name} is currently closed for maintenance.`);
    }

    // Check existing bookings in this slot
    const slotBookings = amenity.bookings.filter(b => b.slot === slot && b.date === date && b.status === "confirmed");
    if (slotBookings.length >= amenity.capacity) {
      throw new Error(`Selected slot ${slot} is at full capacity.`);
    }

    // Check if student already booked this slot
    const alreadyBooked = slotBookings.some(b => b.studentId === studentId);
    if (alreadyBooked) {
      throw new Error("You already have an active reservation for this time slot.");
    }

    const newBooking = {
      id: `bk-${Date.now()}`,
      studentId: studentId,
      studentName: student.name,
      slot: slot,
      date: date || new Date().toISOString().split("T")[0],
      status: "confirmed"
    };

    amenity.bookings.push(newBooking);
    amenity.currentOccupancy = Math.min(amenity.capacity, amenity.currentOccupancy + 1);

    this.save();
    this.notify();
    return newBooking;
  }

  cancelAmenityBooking(amenityId, bookingId) {
    const amenity = this.state.amenities.find(a => a.id === amenityId);
    if (!amenity) return;

    const booking = amenity.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = "cancelled";
      amenity.currentOccupancy = Math.max(0, amenity.currentOccupancy - 1);
      this.save();
      this.notify();
    }
  }

  toggleAmenityStatus(amenityId) {
    const amenity = this.state.amenities.find(a => a.id === amenityId);
    if (!amenity) return;
    amenity.status = amenity.status === "open" ? "maintenance" : "open";
    this.save();
    this.notify();
  }

  // --- Mess Ratings & Menu ---

  rateMeal(day, meal, rating, studentId) {
    const existing = this.state.mealRatings.find(
      r => r.day.toLowerCase() === day.toLowerCase() && r.meal.toLowerCase() === meal.toLowerCase() && r.studentId === studentId
    );
    if (existing) {
      existing.rating = rating;
    } else {
      this.state.mealRatings.push({
        day,
        meal,
        rating,
        studentId
      });
    }
    this.save();
    this.notify();
  }

  getMealAverageRating(day, meal) {
    const ratings = this.state.mealRatings.filter(
      r => r.day.toLowerCase() === day.toLowerCase() && r.meal.toLowerCase() === meal.toLowerCase()
    );
    if (!ratings.length) return { avg: "4.5", count: 0 };
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return {
      avg: (sum / ratings.length).toFixed(1),
      count: ratings.length
    };
  }

  updateMessMenu(day, mealType, itemsArray) {
    const dayMenu = this.state.messMenu.find(m => m.day.toLowerCase() === day.toLowerCase());
    if (dayMenu && dayMenu.meals[mealType]) {
      dayMenu.meals[mealType] = itemsArray;
      this.save();
      this.notify();
    }
  }

  // --- Announcements ---

  createAnnouncement({ title, body, category, pinned }) {
    const newAnn = {
      id: `ann-${Date.now()}`,
      title,
      body,
      category: category || "General",
      pinned: !!pinned,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      readBy: []
    };
    this.state.announcements.unshift(newAnn);
    this.save();
    this.notify();
    return newAnn;
  }

  markAnnouncementRead(id, studentId) {
    const ann = this.state.announcements.find(a => a.id === id);
    if (ann && !ann.readBy.includes(studentId)) {
      ann.readBy.push(studentId);
      this.save();
      this.notify();
    }
  }

  deleteAnnouncement(id) {
    this.state.announcements = this.state.announcements.filter(a => a.id !== id);
    this.save();
    this.notify();
  }
}

export const store = new Store();
