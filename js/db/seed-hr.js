/* Seed: HR & People */
const seedHR = {
  departments: [
    { id:1, name:'Engineering', headId:1, employeeCount:48 },
    { id:2, name:'Sales & Marketing', headId:3, employeeCount:32 },
    { id:3, name:'Finance', headId:4, employeeCount:24 },
    { id:4, name:'HR & Admin', headId:5, employeeCount:18 },
    { id:5, name:'Operations', headId:6, employeeCount:40 }
  ],
  employees: [
    { id:1, name:'Rahul Singh', email:'rahul@amdox.com', initials:'RS', department:'Engineering', role:'Senior Developer', status:'Active', joinDate:'Jan 2024', salary:120000, gradient:'linear-gradient(135deg,#6366f1,#a855f7)' },
    { id:2, name:'Anita Patel', email:'anita@amdox.com', initials:'AP', department:'Sales & Marketing', role:'Sales Manager', status:'Active', joinDate:'Mar 2023', salary:110000, gradient:'linear-gradient(135deg,#ec4899,#f59e0b)' },
    { id:3, name:'Vikram Kumar', email:'vikram@amdox.com', initials:'VK', department:'Finance', role:'Financial Analyst', status:'Active', joinDate:'Jun 2023', salary:95000, gradient:'linear-gradient(135deg,#22c55e,#06b6d4)' },
    { id:4, name:'Priya Sharma', email:'priya@amdox.com', initials:'PS', department:'Engineering', role:'Frontend Developer', status:'Probation', joinDate:'May 2026', salary:85000, gradient:'linear-gradient(135deg,#a855f7,#6366f1)' },
    { id:5, name:'Neha Kapoor', email:'neha@amdox.com', initials:'NK', department:'HR & Admin', role:'HR Manager', status:'Active', joinDate:'Sep 2022', salary:105000, gradient:'linear-gradient(135deg,#f59e0b,#ef4444)' },
    { id:6, name:'Myra Grover', email:'myra.grover@amdox.com', initials:'MG', department:'Engineering', role:'Data Engineer', status:'Active', joinDate:'Mar 2023', salary:86967, gradient:'linear-gradient(135deg,#06b6d4,#6366f1)' },
    { id:7, name:'Amit Sen', email:'amit.sen@amdox.com', initials:'AS', department:'Engineering', role:'Data Scientist', status:'Active', joinDate:'Oct 2022', salary:94067, gradient:'linear-gradient(135deg,#6366f1,#a855f7)' },
    { id:8, name:'Dev Joshi', email:'dev.joshi@amdox.com', initials:'DJ', department:'Engineering', role:'Senior Engineer', status:'Active', joinDate:'Jan 2026', salary:93629, gradient:'linear-gradient(135deg,#ec4899,#f59e0b)' },
    { id:9, name:'Pari Iyer', email:'pari.iyer@amdox.com', initials:'PI', department:'Engineering', role:'System Architect', status:'Active', joinDate:'May 2023', salary:104384, gradient:'linear-gradient(135deg,#22c55e,#06b6d4)' },
    { id:10, name:'Kavya Reddy', email:'kavya.reddy@amdox.com', initials:'KR', department:'Engineering', role:'DevOps Specialist', status:'Active', joinDate:'Oct 2024', salary:100446, gradient:'linear-gradient(135deg,#a855f7,#6366f1)' },
    { id:11, name:'Sneha Pillai', email:'sneha.pillai@amdox.com', initials:'SP', department:'Engineering', role:'Senior Engineer', status:'Active', joinDate:'Aug 2026', salary:113825, gradient:'linear-gradient(135deg,#f59e0b,#ef4444)' }
  ],
  attendance: [
    { id:1, day:'Mon', present:142, absent:8, wfh:12 },
    { id:2, day:'Tue', present:148, absent:5, wfh:9 },
    { id:3, day:'Wed', present:145, absent:10, wfh:7 },
    { id:4, day:'Thu', present:150, absent:3, wfh:9 },
    { id:5, day:'Fri', present:138, absent:15, wfh:9 }
  ],
  leaves: [
    { id:1, employeeId:1, employeeName:'Rahul Singh', type:'Casual Leave', startDate:'May 22, 2026', endDate:'May 24, 2026', status:'Pending', days:3 },
    { id:2, employeeId:4, employeeName:'Priya Sharma', type:'Sick Leave', startDate:'May 18, 2026', endDate:'May 18, 2026', status:'Approved', days:1 }
  ],
  stats: {
    totalEmployees: 5,
    presentToday: 4,
    onLeave: 12,
    newThisMonth: 1
  }
};

