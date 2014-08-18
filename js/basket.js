(function(buy){
	'use strict';
	var Basket = function(data){
		this.containerID = $('#'+data.container);
		this.cols = data.columns; 
		this.theads = data.headers;
		this.data = data.data;
		this.currency =  data.currency;
		this.percentage = data.percentage;
		this.trash = data.trash;
		this.calculate = data.calculate;
		this.button = data.button;
		this.products = JSON.parse(localStorage.getItem(this.data));

		if (this.containerClass === null) {
            throw {
                message: "You didnt insert the element ID"
            };
        }else if(this.cols === null){
        	throw {
                message: "You didnt insert the number of columns"
            };
        } else{
        this.initTable();
        }
	};

	Basket.prototype.initTable = function (container) {
		var that = this;
		var count_heads = this.theads.length;
		this.containerID.append(function(){	
			var html = '<table>';
				if(count_heads > 0){
					html += '<thead>';
					$.each(that.theads, function(i,data){
						html += '<th><span>'+data+'<span></th>';
					});
					html += '</thead>';
				}
				if(that.calculate){
					html += '<tfoot></tfoot>' 
				}
				html += '<tbody></tbody></table>';
			return html;
		});
		this.displayProducts();
		$(document).on( 'click', '.up', this.quantityUp.bind(this));
		$(document).on( 'click', '.down', this.quantityDown.bind(this));
		if(this.trash){
			$(document).on( 'click', '.trash', this.removeProduct.bind(this));
		}
		if(this.button != ''){
			$(document).on( 'click', '#submitBtn', this.submit.bind(this));
		}
	};

	Basket.prototype.displayProducts = function(){
		var that = this;
		var products = this.products;
		var subtotal = [];
		//console.log(products);
		this.containerID.find('tbody').html('');
		this.containerID.find('tbody').append(function(){	
				var html;	
				$.each(that.products, function(i,data){
					//console.log(data);
					html += '<tr id="'+i+'"'+ ((i % 2 == 1)? 'class="trEven"':'')+'>';
					for(var item in data){	
						switch (item){
							case 'title':
								html += '<td class="title">'+data[item]+'</td>';
								break;
							case 'price':
								html += '<td class="price">'+that.currency+data[item]+'</td>';
								break;
							case 'changeValue':
								html += '<td class="changeValue">';
								html += '<div><div class="qty_display">'+data[item]+'<span class="up">+</span><span class="down">-</span></div></div>'
								html += '</td>';
								break;
							case 'total':
								html += '<td class="total">'+that.currency+data[item]+'</td>';
								subtotal.push(data[item]);

								break;
							default:
								html += '<td>'+data[item]+'</td>';
						}
					}
					if(that.trash){
						html += '<td class="trash"><span></span></td>';
					}
					html += '</tr>';
				});
				return html;
		});
		this.productsTotal(subtotal);
	};

	Basket.prototype.removeProduct = function(e){
		var products = this.products;
        var trIndex = $(e.target).parent().parent().attr('id'); 
        console.log(trIndex);     
        products.splice(parseInt(trIndex),1);
        this.products = products;
        this.displayProducts();
	}; 

	Basket.prototype.quantityUp = function(e){
		var products = this.products;
		var max = 10;
        var trIndex = $(e.target).parents('tr').attr('id'); 
        if(products[trIndex].changeValue < max){
	        products[trIndex].changeValue += 1;
			products[trIndex].total = ((products[trIndex].price)*(products[trIndex].changeValue)).toFixed(2);
			this.products = products;
			this.displayProducts();
	    }
	}; 

	Basket.prototype.quantityDown = function(e){
		var products = this.products;
		var min = 1;
        var trIndex = $(e.target).parents('tr').attr('id'); 
        if(products[trIndex].changeValue > min){
	        products[trIndex].changeValue -= 1;
			products[trIndex].total = ((products[trIndex].price)*(products[trIndex].changeValue)).toFixed(2);
			this.products = products;
			this.displayProducts();
	    }
	};

	Basket.prototype.productsTotal = function(totals){
		var that = this;
		var count = totals.length;
		var subtotal = (count > 0) ? Number(eval(totals.join('+')).toFixed(2)) : 0;
		var vat = Number((subtotal * (that.percentage * 0.01)).toFixed(2));
		var total = (subtotal + vat).toFixed(2);

		this.containerID.find('tfoot').html('');
		this.containerID.find('tfoot').html('').append(function(){
			var html = '<tr class="calculate sep"><th colspan="3">Subtotal</th><th class="total">' + that.currency + subtotal + '</th></tr>';
			html += '<tr class="calculate"><th colspan="3">VAT @ 20%</th><th class="total">' + that.currency + vat +'</th></tr>';
			html += '<tr class="ptotal"><th colspan="3">Total Cost</th><th class="total">' + that.currency + total +'</th></tr>';
			if(that.button != '' && count > 0){
				html += '<tr class="pbtn"><th colspan="5"><button id="submitBtn">'+ that.button +'</button></tr>';
			}  
			return html;
		});
	};

	Basket.prototype.submit = function(){
		var products = JSON.stringify(this.products);
		$.ajax({
	        type: "POST",
	        url: "/someURL",
	        contentType: "application/json",
	        dataType: "json",
	        data: products,
	        success: function() {
	            alert('Enjoy your new items');
	        },
	        error: function() {
	        	alert('Oops!');
	        }
	    });
	};

	buy.Basket = Basket;
}(window || this));

//Fake Data 
var dataBuy = [
	{
		'title' : 'Cotton T-shirt, Medium',
		'price' : '1.99',
		'changeValue' : 1,
		'total' : 1.99
	},
	{
		'title' : 'Baseball Cap, One Size',
		'price' : '2.99',
		'changeValue' : 2,
		'total' : 5.98
	},
	{
		'title' : 'Swim Shorts, Medium',
		'price' : '3.99',
		'changeValue' : 1,
		'total' : 3.99
	}
];
localStorage.setItem("localDataBuy",JSON.stringify(dataBuy));