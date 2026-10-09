"use client";

import { useEffect, useState } from "react";

type Overview = {
  registered_teams: number; teams_submitted: number; total_submissions: number;
  completed_scenarios: number; pending_scenarios: number;
};
type Submission = { team_id:string; team_name:string|null; scenario_id:string; score:number; maximum_marks:number; percentage:number; submitted_at:string };
type Team = { team_id:string; team_name:string|null; completed:number; total_scenarios:number; total_score:number; scenarios:Record<string, {score:number;maximum_marks:number;percentage:number}|null> };

function Card({label,value,meta,accent}:{label:string;value:number|string;meta:string;accent?:string}) {
  return <div className={`ops-card ${accent||""}`}><span>{label}</span><strong>{value}</strong><small>{meta}</small></div>;
}

export default function AdminDashboardPage() {
  const [overview,setOverview]=useState<Overview|null>(null);
  const [submissions,setSubmissions]=useState<Submission[]>([]);
  const [teams,setTeams]=useState<Team[]>([]);
  const [error,setError]=useState("");
  useEffect(()=>{ Promise.all([
    fetch("/api/admin/overview",{cache:"no-store"}).then(r=>r.json()),
    fetch("/api/admin/teams",{cache:"no-store"}).then(r=>r.json())
  ]).then(([a,b])=>{
    if(!a.success) throw new Error(a.error||"Overview unavailable");
    if(!b.success) throw new Error(b.error||"Teams unavailable");
    setOverview(a.overview); setSubmissions(a.recent_submissions||[]); setTeams(b.teams||[]);
  }).catch(e=>setError(e.message)); },[]);

  if(error) return <div className="ops-alert danger">{error}</div>;
  if(!overview) return <div className="ops-loading">Loading command center…</div>;

  const progress = overview.registered_teams ? Math.round((overview.completed_scenarios/(overview.registered_teams*4))*100) : 0;
  return <div>
    <div className="ops-page-head">
      <div><span className="eyebrow">COMMAND CENTER</span><h1>Contest Overview</h1><p>Live operational view of teams, submissions and scenario progress.</p></div>
      <a className="ops-button primary" href="/admin/contest">Contest controls →</a>
    </div>

    <div className="ops-grid stats">
      <Card label="REGISTERED TEAMS" value={overview.registered_teams} meta="Active registrations"/>
      <Card label="STUDENTS" value={overview.registered_teams*6} meta="6 students / team"/>
      <Card label="SUBMISSIONS" value={overview.total_submissions} meta={`${overview.teams_submitted} teams have submitted`} />
      <Card label="COMPLETED" value={overview.completed_scenarios} meta={`${progress}% of 40 scenario slots`} accent="good"/>
      <Card label="PENDING" value={overview.pending_scenarios} meta="Scenario slots remaining" accent="warn"/>
    </div>

    <div className="ops-two-col">
      <section className="ops-panel">
        <div className="panel-head"><div><h2>Team progress</h2><p>Scenario completion by registered team.</p></div><a href="/admin/teams">View all</a></div>
        <div className="team-list">
          {teams.map(t=><a className="team-row" key={t.team_id} href={`/admin/teams/${t.team_id}`}>
            <div className="team-id"><b>{t.team_id}</b><span>{t.team_name||"Registered team"}</span></div>
            <div className="progress"><i style={{width:`${(t.completed/4)*100}%`}}/></div>
            <b className="team-score">{t.completed}/4</b>
          </a>)}
        </div>
      </section>

      <section className="ops-panel">
        <div className="panel-head"><div><h2>Recent submissions</h2><p>Latest evaluator results.</p></div><a href="/admin/submissions">View all</a></div>
        <div className="submission-list">
          {submissions.slice(0,8).map((s,i)=><a className="submission-row" key={`${s.team_id}-${s.scenario_id}-${i}`} href={`/admin/teams/${s.team_id}`}>
            <div><b>{s.team_id}</b><span>{s.scenario_id}</span></div>
            <strong>{s.percentage}%</strong>
            <small>{new Date(s.submitted_at).toLocaleTimeString()}</small>
          </a>)}
          {!submissions.length && <div className="empty">No submissions yet.</div>}
        </div>
      </section>
    </div>
  </div>;
}
