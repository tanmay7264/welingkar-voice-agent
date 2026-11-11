import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Theme} from '@astryxdesign/core/theme';
import {matchaTheme} from '@astryxdesign/theme-matcha/built';
import {VStack,HStack} from '@astryxdesign/core/Stack';
import {Grid} from '@astryxdesign/core/Grid';
import {Section} from '@astryxdesign/core/Section';
import {Text,Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Banner} from '@astryxdesign/core/Banner';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {SegmentedControl,SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Table,proportional} from '@astryxdesign/core/Table';
import {Divider} from '@astryxdesign/core/Divider';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-matcha/theme.css';
import {filterProgrammes,sectors,cities,roles,projects,recruiters,history} from './data.js';

const muted={color:'var(--color-text-secondary)'};
const soft={background:'var(--color-background-surface)',borderRadius:'var(--radius-container)',border:'1px solid var(--color-border)'};
const sectionStyle={scrollMarginTop:'var(--spacing-10)'};
function Block({id,title,note,children}){return <Section id={id} padding={6} style={{...soft,...sectionStyle}}><VStack gap={5}><VStack gap={1}><Heading level={2}>{title}</Heading>{note&&<Text type="supporting" style={muted}>{note}</Text>}</VStack>{children}</VStack></Section>;}
function Bars({rows,max,label}){return <VStack gap={4} aria-label={label}>{rows.map(([name,value])=><ProgressBar key={name} label={name} value={value} max={max} hasValueLabel formatValueLabel={v=>String(v)} />)}</VStack>;}
function App(){
  const [query,setQuery]=useState('');
  const [measure,setMeasure]=useState('offers');
  const matches=filterProgrammes(query);
  return <Theme theme={matchaTheme} mode="light"><VStack gap={0} style={{minHeight:'100vh',background:'var(--color-background-body)',color:'var(--color-text-primary)'}}>
    <Section padding={4} dividers={['bottom']}><HStack gap={4} hAlign="between" vAlign="center" wrap="wrap">
      <HStack gap={4} vAlign="center"><a href="../" aria-label="Welingkar Mumbai home"><img src="./brand/weschool-logo.svg" alt="WeSchool · Welingkar Education" style={{width:'calc(var(--spacing-10) * 2.5)',height:'auto'}}/></a><Text weight="semibold">Recruiter connect</Text></HStack>
      <HStack gap={2} wrap="wrap"><Button href="#programmes" label="Programmes" variant="ghost"/><Button href="#outcomes" label="Outcomes" variant="ghost"/><Button href="../#voice-workspace" label="Talk to Aanya ↗" variant="secondary"/></HStack>
    </HStack></Section>
    <main style={{width:'100%',maxWidth:'90rem',marginInline:'auto',padding:'clamp(var(--spacing-4),4vw,var(--spacing-10))'}}><VStack gap={6}>
      <Banner variant="warning" title="Illustrative demo, not verified placement results" description="All figures, companies and outcomes are fictional. Confirm current availability and batch details with CMC."/>
      <Section padding={0} style={{...soft,overflow:'hidden'}}><Grid columns={{minWidth:320,max:2}} gap={0}>
        <VStack gap={5} padding={8} vAlign="center" style={{padding:"clamp(var(--spacing-4),4vw,var(--spacing-8))"}}><Text type="supporting" style={{...muted,letterSpacing:'.12em'}}>WELINGKAR MUMBAI · PGDM 2025–27</Text><Heading level={1} style={{fontSize:'clamp(2.5rem,4vw,4rem)',lineHeight:1.04,letterSpacing:'-.045em'}}>Potential, meet<br/>opportunity.</Heading><Text style={{...muted,maxWidth:'38ch'}}>A closer look at the people behind the programmes. Explore their learning, experience and career pathways — all in one recruiter workspace.</Text><HStack gap={3} wrap="wrap"><Button href="#programmes" label="Explore the batch ↓" variant="primary"/><Button label="Save as PDF" variant="secondary" onClick={()=>window.print()}/></HStack><Text type="supporting" style={muted}>8 programmes · One place to begin your hiring conversation</Text></VStack>
        <figure style={{margin:0,position:'relative',minHeight:'24rem'}}><img src="./brand/recruiter-team.png" alt="AI illustration of business graduates collaborating in a sunlit workspace" style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute'}}/><figcaption style={{position:'absolute',bottom:'var(--spacing-3)',right:'var(--spacing-3)',background:'var(--color-background-surface)',padding:'var(--spacing-2)',borderRadius:'var(--radius-inner)',fontSize:'var(--font-size-xs)'}}>AI-generated illustration · not actual students</figcaption></figure>
      </Grid></Section>
      <Grid columns={{minWidth:180,max:4}} gap={4}>{[['Batch size','680','Across 8 PGDM programmes'],['Placed in this demo','512','80% of 640 opted in'],['Average CTC','₹15.4 LPA','Illustrative offer-weighted average'],['Highest CTC','₹34.5 LPA','Illustrative, not a salary promise']].map(([label,value,note])=><Section key={label} padding={5} style={soft}><VStack gap={2}><Text type="supporting" style={muted}>{label}</Text><Heading level={2} style={{fontSize:'2rem'}}>{value}</Heading><Text type="supporting" style={muted}>{note}</Text></VStack></Section>)}</Grid>
      <Block id="programmes" title="Find your talent pipeline" note="Browse the illustrative cohort. Programme counts do not indicate current candidate availability.">
        <TextInput label="Search programmes" placeholder="Try business, retail or healthcare" value={query} onChange={setQuery}/>
        <Text aria-live="polite" type="supporting">{matches.length} {matches.length===1?'programme':'programmes'} · {matches.reduce((sum,p)=>sum+p.students,0)} students in this view</Text>
        {matches.length?<Table data={matches} idKey="name" columns={[{key:'name',header:'PGDM programme',width:proportional(3)},{key:'students',header:'Students',align:'end'}]} density="spacious"/>:<Text>No programme matches “{query}”. Try another name.</Text>}
      </Block>
      <Grid columns={{minWidth:320,max:2}} gap={6}>
        <Block id="outcomes" title="Where potential takes shape" note="Fictional placements across seven sectors. CTC in lakh per annum."><SegmentedControl label="Sector chart measure" value={measure} onChange={setMeasure}><SegmentedControlItem value="offers" label="Offers"/><SegmentedControlItem value="average" label="Avg. CTC"/><SegmentedControlItem value="highest" label="Highest CTC"/></SegmentedControl><Bars label="Placements by sector" rows={sectors.map(s=>[s.name,s[measure]])} max={measure==='offers'?128:35}/></Block>
        <Block title="A world of career paths" note="City-level placements in the same illustrative snapshot."><Bars label="Placements by city" rows={cities} max={196}/></Block>
      </Grid>
      <Grid columns={{minWidth:320,max:2}} gap={6}>
        <Block title="Roles gaining momentum" note="Illustrative offers and growth compared with the previous season."><Table data={roles.map(([name,offers,growth])=>({name,offers,growth:`+${growth}%`}))} idKey="name" columns={[{key:'name',header:'Role',width:proportional(3)},{key:'offers',header:'Offers'},{key:'growth',header:'Growth'}]}/></Block>
        <Block title="Experience before the first offer" note="Illustrative project experience across the batch."><Grid columns={2} gap={5}>{[['1,340','Live industry projects'],['680','Summer internships'],['410','Capstone / research projects'],['57','Case-competition wins']].map(([value,label])=><VStack key={label} gap={1}><Heading level={3} style={{fontSize:'1.8rem'}}>{value}</Heading><Text type="supporting" style={muted}>{label}</Text></VStack>)}</Grid><Divider/><Text>These examples describe the demo cohort, not proven abilities of every student. Explore programme fit with Aanya and confirm candidate details with CMC.</Text><Button href="../#voice-workspace" label="Explore programme fit with Aanya ↗" variant="secondary"/></Block>
      </Grid>
      <Block id="projects" title="From classroom thinking to practical work" note="Selected fictional examples of learning in action."><Table data={projects.map(([name,context,outcome])=>({name,context,outcome}))} idKey="name" columns={[{key:'name',header:'Project',width:proportional(2)},{key:'context',header:'Experience'},{key:'outcome',header:'Illustrative outcome',width:proportional(2)}]} density="spacious"/></Block>
      <Grid columns={{minWidth:320,max:2}} gap={6}><Block title="Illustrative recruiter activity" note="Fictional company names and packages."><Table data={recruiters} idKey="name" columns={[{key:'name',header:'Company',width:proportional(2)},{key:'hires',header:'Hires'},{key:'average',header:'Avg. CTC'}]}/></Block><Block title="Past cohorts at a glance" note="Fictional historical figures. Not verified placement claims."><Table data={history} idKey="year" columns={[{key:'year',header:'Batch'},{key:'placed',header:'Placed'},{key:'median',header:'Median CTC'}]}/></Block></Grid>
      <Section variant="muted" padding={8} style={{borderRadius:'var(--radius-container)'}}><HStack gap={6} hAlign="between" vAlign="center" wrap="wrap"><VStack gap={3}><Text type="supporting">YOUR NEXT GREAT TEAM STARTS HERE</Text><Heading level={2}>Let’s find the right conversation.</Heading><Text style={muted}>Ask Aanya about programmes and hiring formats.<br/>CMC confirms current availability and next steps.</Text></VStack><Button href="../#voice-workspace" variant="primary" label="Talk to Aanya ↗"/></HStack></Section>
      <Text type="supporting" style={muted}>Welingkar Mumbai · Career Management Cell · Fictional demonstration data · Built with Astryx</Text>
    </VStack></main>
  </VStack></Theme>;
}
createRoot(document.getElementById('batch-root')).render(<App/>);
