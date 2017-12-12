/*! <DEBUG:undefined> */
function anonymous($data,$filename) {'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
$out+=' <li> <img src="';
$out+=$escape($value.onePhoto);
$out+='"> <span class="see-money">';
$out+=$escape(￥$value.price.00);
$out+='</span> </li> ';
});
return new String($out);}