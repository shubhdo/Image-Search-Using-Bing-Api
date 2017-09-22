const mongoose=require('mongoose')
const db=mongoose.connection;

db.on('error', function (error) {
    console.log(error);
});

db.once('open', function () {
    console.log("connected");
});

let Schema=mongoose.Schema;


let Recent=new Schema({
    recent:{
        type:String,
        trim:true,
    },
}, { timestamps: { createdAt: 'created_at' }}
);
module.exports=mongoose.model('Recent',Recent,'Recent');