// Frozen, fictional recruiter snapshot from the previously bundled dashboard.
export const programmes = [
  {name:'PGDM (General)',students:240}, {name:'E-Business',students:90},
  {name:'Business Analytics',students:90}, {name:'Media & Entertainment',students:60},
  {name:'Business Design',students:45}, {name:'Healthcare',students:60},
  {name:'Retail',students:60}, {name:'Rural Management',students:35},
];
export const sectors = [
  {name:'BFSI',offers:128,average:15.8,highest:32},
  {name:'Consulting',offers:82,average:17.6,highest:34.5},
  {name:'Tech / SaaS',offers:92,average:16.9,highest:30},
  {name:'FMCG',offers:74,average:14.2,highest:28},
  {name:'E-commerce',offers:66,average:14.9,highest:26},
  {name:'Healthcare',offers:38,average:12.4,highest:21},
  {name:'Media',offers:32,average:11.8,highest:19.5},
];
export const cities = [['Mumbai',196],['Bengaluru',104],['Gurugram / Delhi NCR',78],['Pune',52],['Hyderabad',34],['Chennai',22],['Dubai',12],['Singapore',9],['London',5]];
export const roles = [['Business / Data Analyst',82,27],['Product Manager / APM',64,38],['Brand / Product Marketing',61,9],['Management Consultant',58,15],['Relationship Manager (Wealth)',55,6],['Category / Growth Manager',47,21]];
export const projects = [
  ['Churn prediction for a regional bank','BFSI · Live project','Cut early churn by 11% in pilot'],
  ['D2C pricing redesign','FMCG · Summer internship','Rolled out to 3 SKUs; PPO offered'],
  ['Rural micro-credit distribution','NGO partner · Capstone','Study adopted across 40 villages'],
  ['SaaS onboarding funnel','Technology · Live project','18% higher activation in A/B test'],
  ['OTT content-slate dashboard','Media · Summer internship','Used in weekly reviews'],
  ['Hospital bed-turnaround optimisation','Healthcare · Capstone','Average turnaround down 22 minutes'],
];
export const recruiters = [
  {name:'Meridian Consumer Brands',sector:'FMCG',hires:14,average:'₹16.5 LPA'},
  {name:'Northstar Digital',sector:'Tech / SaaS',hires:18,average:'₹18.2 LPA'},
  {name:'Summit Consulting Group',sector:'Consulting',hires:16,average:'₹19 LPA'},
  {name:'Harbour Capital Bank',sector:'BFSI',hires:22,average:'₹15.4 LPA'},
  {name:'Cartwheel Commerce',sector:'E-commerce',hires:12,average:'₹15 LPA'},
  {name:'Lumen Health',sector:'Healthcare',hires:9,average:'₹13.2 LPA'},
];
export const history = [{year:2022,placed:'94%',median:'₹11.8 LPA'},{year:2023,placed:'95%',median:'₹12.6 LPA'},{year:2024,placed:'96%',median:'₹13.4 LPA'},{year:2025,placed:'97%',median:'₹14.1 LPA'}];
export function filterProgrammes(query) {return programmes.filter(p=>p.name.toLowerCase().includes(query.trim().toLowerCase()));}
