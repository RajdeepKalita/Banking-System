const { concatSeries } = require('async');
var bodyparser=require("body-parser");
var express=require("express");
var app=express();

var mongoose=require("mongoose");
const methodOverride = require('method-override');
const Transaction = require('./models/transaction');
mongoose.connect("mongodb://localhost/bank",{useNewUrlParser:true});
var bankSchema=new mongoose.Schema({
	name:String,
	email:String,
	balance:Number
});
var Customer=mongoose.model("Customer",bankSchema);//capital starting letters conventional

mongoose.set('useFindAndModify', false);
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended: true}));


//var george=new Customer({
//	name:"Mark",
//	email:"mark@gmail.com",
	//balance:10273
//});
//george.save(function(err,customer){
	//if(err){
		//console.log("You have an error");
	//}
	//else
		//console.log("Data have been saved");
	    //console.log(customer);
	
//});


app.get("/",function(req,res){
	res.render("landing.ejs");
});
app.get("/customers",function(req,res){
	Customer.find(
	{},function(err,allcustomer){
		res.render("list.ejs",{customer:allcustomer});
		
	});});

app.get("/customers/:id", async(req, res)=> {
    const { id } = req.params;
    const user =  await Customer.findById(id);
    const users = await Customer.find({})
    res.render("transfer.ejs", {user, users});
});

app.get("/customers/:id1/:id2", async(req, res)=> {
    const {id1, id2} = req.params;
    const fromUser =  await Customer.findById(id1);
    const toUser =  await Customer.findById(id2);
    res.render("form.ejs", {fromUser, toUser});
});

app.put("/customers/:id1/:id2", async(req, res) =>{
    const {id1, id2} = req.params;
    const credit = parseInt(req.body.credit);
    const fromUser = await Customer.findById(id1);
    const toUser = await Customer.findById(id2);

    if(credit <= fromUser.balance && credit>0){
        
        let fromCreditsNew = fromUser.balance - credit;
        let toCreditsNew = parseInt(toUser.balance + credit);
        await Customer.findByIdAndUpdate(id1, {balance : fromCreditsNew}, { runValidators: true, new: true });
        await Customer.findByIdAndUpdate(id2, {balance : toCreditsNew}, { runValidators: true, new: true });

        let newTransaction = new Transaction();
        newTransaction.fromName = fromUser.name;
        newTransaction.toName = toUser.name;
        newTransaction.transfer = credit;
        await newTransaction.save();
		

        res.redirect("/customers");
    }
    else{
        res.render('error');
    }
});

app.get("/history", async(req, res)=>{
    const transactions = await Transaction.find({});
    res.render("history.ejs", {transactions});
});





app.listen(100,process.env.IP,function(){
	console.log("The MovieApp has started");
});

