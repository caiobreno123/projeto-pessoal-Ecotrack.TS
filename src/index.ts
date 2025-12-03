import express from 'express';
import fs from 'fs';
import path from 'path';

abstract class Item {
  constructor(
    public id:string,
    public title:string,
    public description:string,
    public dueDate:string|null,
    public priority:string,
    public completed:boolean=false
  ){}
}

class Bill extends Item{
  constructor(
    id:string,
    title:string,
    description:string,
    dueDate:string|null,
    priority:string,
    public amount:number,
    completed:boolean=false,
    public paid:boolean=false
  ){ super(id,title,description,dueDate,priority,completed);}
}

class Task extends Item{}

class AnnotadorDB{
  file=path.join(__dirname,'../data/items.json');
  load(){ if(!fs.existsSync(this.file)) return []; return JSON.parse(fs.readFileSync(this.file,'utf8')); }
  save(data:any){ fs.writeFileSync(this.file,JSON.stringify(data,null,2)); }
}

const db=new AnnotadorDB();
const app=express();
app.use(express.json());

app.get('/items',(req,res)=>{res.json(db.load());});
app.post('/items',(req,res)=>{
  const {type,title,description,dueDate,priority,amount}=req.body;
  const id='id_'+Math.random().toString(36).slice(2,9);
  let item:any;
  if(type==='bill') item=new Bill(id,title,description,dueDate,priority,Number(amount));
  else item=new Task(id,title,description,dueDate,priority);
  const arr=db.load(); arr.push(item); db.save(arr);
  res.json(item);
});

app.delete('/items/:id',(req,res)=>{
  const arr=db.load().filter((i:any)=>i.id!==req.params.id);
  db.save(arr);
  res.json({ok:true});
});

app.listen(3000,()=>console.log('API rodando em 3000'));
