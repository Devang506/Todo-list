//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



//database create
mongoose.connect('mongodb+srv://Devangjoshi1210:Devang12345@atlascluster.kmp6b.mongodb.net/todolistDB');
// Schema
const itemsSchema  = new mongoose.Schema({
  item : String
});
// custome list Schema
const listSchema = {
  name : String,
  items : [itemsSchema]
};
const List =  mongoose.model("List",listSchema);
//model
const Item =  mongoose.model("Item",itemsSchema);

const item1 = new Item({
  item : "Welcome to your todolist"
})
const item2 = new Item({
  item : "Hit the + button to add new Item"
})
const item3 = new Item({
  item : "<--- Hit the checbox to delete item"
})
const defaultItems = [item1,item2,item3];


app.get("/:customListName", function(req,res){ // express routing parameters
      const customListName = _.capitalize(req.params.customListName);
     // if same name list is already exist
    List.findOne({name:customListName},function(err,foundList){
       if(!err){
         if(!foundList){
           const list = new List({
             name :  customListName,
             items : defaultItems
           })
           list.save();
            res.redirect("/"+customListName);
         }else{

           res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
         }
       }
     })

})
app.post("/cutomRoute",function(req,res){
  const customListName = req.body.newCustomList;
  res.redirect("/"+customListName);
})
//search
app.post("/search",function(req,res){
  const customListName = _.capitalize(req.body.existCustomList);
  if(customListName=="Today"){
    res.redirect("/");
  }
  List.findOne({name:customListName},function(err,foundList){
     if(!err){
       if(!foundList){
         res.render("not_found");
       }else{
         res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
       }
     }
   })
})
app.get("/", function(req, res) {


// rendering inserted data in database
Item.find(function(err,items){
  if(err){
    console.log("err");
  }else{
      if(items.length===0){
        // inserting default items
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log("err");
          }else{
            console.log("Items added succesfully");
          }
        });
        res.redirect("/");
      }
      else{
  res.render("list", {listTitle: "Today", newListItems: items});
}

  }
})


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

    const item  = new Item({
      item : itemName
    })

    if(listName==="Today"){
     if(item.item===undefined){
         res.redirect("/");
     }
     else{
         item.save();
        res.redirect("/");
      }
    }else{
      List.findOne({name:listName},function(err,foundList){

          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listName);

      });
    }




});
// deleteing items from list when clicking checkbox VVV IMP
app.post("/delete",function(req,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  const listItem= req.body.listItem;
   var flag = false;
  if(listName==="Today"){

  defaultItems.forEach(function(item){

    if(item.item===listItem){
      flag = true;

      res.redirect("/");
    }
  });

      if(flag===false){
    Item.findByIdAndRemove(checkedItem,function(err){
      if(err){
        console.log("err");
      }else{
        console.log("succesfully deleted");
      }
    });
    res.redirect("/");
  }
  }else{
    defaultItems.forEach(function(item){

      if(item.item===listItem){
        flag = true;

        res.redirect("/"+listName);
      }
    });
     if(flag===false){
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
  }

})


app.listen(process.env.PORT||3000, function() {
  console.log("Server started succesfully");
});
