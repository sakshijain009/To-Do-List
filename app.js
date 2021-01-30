//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistdb",{useNewUrlParser:true});
//******************************************************

const itemsSchema={
  name: String
};
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Make A List!"
});
const item2 = new Item({
  name: "Wake Up"
});
const defaultItems = [item1,item2];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);


//******************************************************

app.get("/", function(req, res) {
  Item.find({},function(err,findItems){
    if (findItems.length===0){
      Item.insertMany(defaultItems,function(err){
      if (err) { console.log('error'); }
      else console.log('yay');
      res.redirect("/");
      });
    }else{
      res.render("list", {listTitle: "Today", newListItems: findItems});
    }
    
  });

});


/**************************************************/
app.post("/", function(req, res){

  const item = req.body.newItem;
  const ListName = req.body.list;
  const itemx = new Item({
    name: item
  });

  if(ListName=="Today"){
    itemx.save();
    res.redirect("/");
  }else{
    List.findOne({name:ListName},function(err,foundlist){
      foundlist.items.push(itemx);
      foundlist.save();
      res.redirect("/"+ListName);
    });
  }
  
});



app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const ListName = req.body.listName;

  if(ListName==="Today"){
    Item.findByIdAndRemove(checkedItem,function(err){
      if (!err) {
        console.log("Successfully deleted");
        res.redirect("/");
      }
    }); 
  }else{
    List.findOneAndUpdate({name: ListName},{$pull:{items:{_id:checkedItem}}},function(err,foundlist){
      if (!err) {
        res.redirect("/"+ListName);
      }
    });
  }
   
});

/**********************************************/

app.get("/:customListName", function(req,res){
  const customName=_.capitalize(req.params.customListName);

  List.findOne({name: customName},function(err,foundlist){
      if (!err) {
        if (!foundlist) {
          const list = new List({
          name:customName,
          items:defaultItems
          });
          list.save();
          res.redirect("/"+customName);
        }else{
          res.render("list", {listTitle:foundlist.name, newListItems:foundlist.items});
        }
      }
  });

});



/***********************************************/
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
