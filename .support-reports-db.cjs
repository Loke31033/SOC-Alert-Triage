const fs=require("fs"),path=require("path");
const root=process.cwd();
function envFile(f){if(!fs.existsSync(f))return;for(const raw of fs.readFileSync(f,"utf8").split(/\r?\n/)){const l=raw.trim();if(!l||l.startsWith("#"))continue;const m=l.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);if(m){let v=m[2].trim();if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);if(!(m[1] in process.env))process.env[m[1]]=v;}}}
for(const f of [".env",".env.local",".env.development",".env.development.local"])envFile(path.join(root,f));
const url=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.POSTGRESQL_URL||process.env.POSTGRES_PRISMA_URL||process.env.POSTGRES_URL_NON_POOLING;
const cfg=url?{connectionString:url}:{host:process.env.PGHOST,port:process.env.PGPORT?Number(process.env.PGPORT):undefined,user:process.env.PGUSER,password:process.env.PGPASSWORD,database:process.env.PGDATABASE};
if(!url&&!process.env.PGHOST&&!process.env.PGDATABASE){console.error("NO_DB_CONFIG: DATABASE_URL/POSTGRES_URL/PGHOST not found in frontend env files");process.exit(2)}
const {Client}=require("pg");
(async()=>{const c=new Client(cfg);try{await c.connect();await c.query(process.argv[2]);console.log("DB_OK")}finally{await c.end().catch(()=>{})}})().catch(e=>{console.error("DB_ERROR:",e.message);process.exit(1)});
