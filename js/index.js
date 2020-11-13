async function activate(){

    webix.CustomScroll.init();
    webix.i18n.setLocale("ru-RU");
    var connection = new JsStore.Connection(new Worker('assets/jsstore/jsstore.worker.js'));


    var dm_colors = [
            "white",
            "silver",
            "gray",
            "red",
            "maroon",
            "yellow",
            "olive",
            "lime",
            "green",
            "aqua",
            "teal",
            "blue",
            "navy",
            "fuchsia",
            "purple"
        ];

    dm_size = [
        20,
        30,
        40,
        50,
        60
    ]
    
    var duration = 60;


    var dbName ='dbGame';
    function getDbSchema(){
        var tblProduct = {
            name: 'results',
            columns: {
                
                id:{
                    primaryKey:true
                },
                name:{
                    notNull:true, 
                    dataType: "string" 
                },
                total:{
                    notNull:true, 
                    dataType:"number" 
                }
            }
        };
        var db = {
            name: dbName,
            tables: [tblProduct]
        }
        return db;
    }

    var database = getDbSchema();
    const isDbCreated = await connection.initDb(database);
    var results = await connection.select({from: 'results'});


    init();
    

    function init(){
        var _interface = {
            rows:[
                pageTitle(),
                {
                    cols:[
                        {width:5},
                        btnStart(),
                        {width:10},
                        btnRestart(),
                        {},
                        score(),
                        {width:10},
                        timer(),
                        {width:365}
                    ]
                },
                {height:10},
                {
                    cols:[
                        gameField(),
                        scoretable()
                    ],
                    padding:5,
                    margin:5,
                    css:{"background":"#f5f4f4"}
                }                
            ]
        };
        webix.ui(_interface);
    }

    function pageTitle(){
        var ret =
        {
            height:40,
            view:"template",
            template:'<span style="font-size:18px;line-height:36px;">PAGE TITLE</span>',
            borderless:true,
        };
        return ret;
    }

    function scoretable(){
        var ret = {
            view:"datatable",
            id:"scoretable",
            select:"row",
            headerRowHeight:28,
            rowHeight:28,
            columns:[
                {
                    id:"name",
                    header:["Name",{content:"textFilter"}],
                    fillspace:true,
                    sort:"string",
                },
                {
                    id:"total",
                    header:"Total",
                    width:50,
                    sort:"int",
                }
            ],
            data: results,
            width:350
        };
        return ret;
    }
     
    function runGame(){
        
        if($$("timer").config.timerId >0){
            _clearInterval();
        }else{
            $$("timer").config.timerId = setInterval(()=>{
                var v =  parseInt($$("timer").getValue())- 1;
                $$("timer").setValue(v);
                if(v===0){
                    $$("gameField").disable();
                    _clearInterval();
                    save();
                }
            }, 1000);
        }
        
        function _clearInterval(){
            clearInterval($$("timer").config.timerId );
            $$("timer").config.timerId  = 0;
            $$("btnStart").setValue("START");
            
        }
    }

    function score(){
        var ret = 
        {
            view:"text",
            id:"score",
            label:"score",
            labelWidth:50,
            width:120,
            readonly:true,
            value:"0",
            timerId:0,
            css:"text"
        };

        return ret;
    }

    function timer(){
        var ret = 
        {
            view:"text",
            id:"timer",
            label:"time",
            labelWidth:50,
            width:120,
            readonly:true,
            value:duration,
            timerId:0,
            css:"text"
        };
        return ret;
    }
    
    function gameField(){
        var ret = 
        {
            view:"abslayout",
            id:"gameField",
            cells:[
                {
                    css:{"background":"black"},
                    relative:true,
                    id:"fld"
                }
            ]
        };
        return ret;
    }
    
    function btnStart(){
        var ret = 
        {
            id:"btnStart",
            view:"button",
            value:"START",
            width:150,
            css:"headerBtn",
            on:{
                onItemClick:function(){
                    
                    
                    if(parseInt($$("timer").getValue())===0){
                        $$("btnRestart").callEvent("onItemClick");
                        return;
                    }
                    
                    if($$("timer").config.timerId ===0){
                    
                        $$("gameField").enable();
                        $$("btnRestart").enable();
                        $$("btnStart").setValue("PAUSE");
                        runGame();
                        addCard();
                        
                    }else{
                        
                        clearInterval($$("timer").config.timerId );
                        $$("timer").config.timerId  = 0;
                        $$("gameField").disable();
                        $$("btnStart").setValue("START");
                    }
                }
            }
        };
        return ret;
    }
    
    function btnRestart(){
        var ret = 
        {
            id:"btnRestart",
            view:"button",
            value:"NEW GAME",
            disable:true,
            width:150,
            css:"headerBtn",
            on:{
                onItemClick:function(){
                    escGame();
                    runGame();
                    addCard();
                    $$("btnStart").setValue("PAUSE");
                }
            }
        };
        return ret;
    }
    
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }
    
    function addCard(){
        
        var _color = getRandomInt(0,dm_colors.length-1);
        var _size =  getRandomInt(0,dm_size.length-1);
        var card =
        {
            view:   "button",
            value:  "",
            width:  dm_size[_size],
            height: dm_size[_size],
            top:    getRandomInt(10,$$("gameField").$height -80),
            left:   getRandomInt(10,$$("gameField").$width  -80),
            on:{
                onItemClick:function(){
                    $$("gameField").removeView(this.config.id);
                    for(var i=0;i<=(getRandomInt(0,2));i++){
                        addCard(); 
                    }
                    calc(_color);
                },
                onAfterRender:function(){
                    (this.getNode().getElementsByClassName('webix_button')[0]).setAttribute("style",`background:${dm_colors[_color]};`);
                }
            }
            
        };
        $$("gameField").addView(card);
    }
    
    function calc(color_id){
        // console.log(color_id);
        $$("score").setValue(parseInt($$("score").getValue())+ 1);
    }


    function escGame(){
        $$("timer").setValue(duration);
        $$("gameField").removeView("fld");
        $$("gameField").addView({
            css:{"background":"black"},
            relative:true,
            id:"fld"
        });
        $$("btnStart").enable();
        $$("gameField").enable();
        $$("score").setValue(0);
        
    }
    
    function save(){
        
                    
        var window = 
        {
            view:"window",
            id:'Form2',
            position:"center",
            modal:true,
            move:true,
            width:480,
            height:320,
            css:{"padding":"0 !important;","border-radius":"0 !important;"},
            borderless:true,
            head:_header(),
            body:
            {
                rows:[
                    {
                        view:"text",
                        label:"YOU SCORE",
                        labelWidth:100,
                        value:$$("score").getValue(),
                        readonly:true,
                    },
                    {
                        view:"text",
                        label:"NAME",
                        id:"name",
                        labelWidth:100,
                        value:""
                    },
                    {
                        cols:[
                            {},
                            {
                                view:"button",
                                value:"Save",
                                css:"headerBtn",
                                on:{
                                    onItemClick:function(){

                                        if($$("name").getValue().length<5){
                                            webix.alert({
                                                title: "Error",
                                                text: "The name must include at least 5 characters",
                                                type:"alert-error"
                                            })
                                            return;
                                        }

                                        var val ={
                                                id:webix.uid(),
                                                name:$$("name").getValue(),
                                                total:parseInt($$("score").getValue())
                                            };

                                        connection.insert({
                                            upsert: true,
                                            into:   'results',
                                            values: [val]
                                        });

                                        $$("scoretable").add(val);
                                        escGame();
                                        $$("Form2").close();
                                    }
                                }
                            },
                            {}
                        ]
                    }
        
                ],
                padding:4,
                margin:4
        
            }
        };
        
        
        webix.ui(window).show();
        $$("name").focus();
        
        function _header(){
            var ret = 
            {
                    margin: 2,
                    padding:2,
                    cols:[
                        
                        {
                             
                            view:"button",
                            id:"hdrSaveBtn",
                            value:"save",
                            on:{
                                onAfterRender:function(){
                                    (this.getNode().getElementsByClassName('webix_button')[0]).innerHTML=`<i class="fal fa-save  fa-lg"></i> Save`;
                                    ($$("hdrSaveBtn").getNode().getElementsByClassName('webix_button')[0]).setAttribute("style", `
                                        background: black;
                                        text-align: left;
                                        color: white;
                                    `);
                                },
                            }

                        },
                        {},
                        { 
                            view:"button", 
                            css:"header_btn pt-0 height_btn-30",
                            on:{
                                onAfterRender:function(){
                                    (this.getNode().getElementsByClassName('webix_button')[0]).innerHTML=`<i class="fal fa-times  fa-lg"></i>`;
                                },
                                onItemClick:function(){
                                    escGame();
                                    $$("Form2").close();
                                }
                            },
                            width:34
                        }, 
                    ],
                    height:40,
                    css:{"background":"black"}
            }; 
            return ret;
        }
    }
    
}