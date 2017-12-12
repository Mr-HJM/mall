{{each}}
<ul class="fl" data-id="{{$value.id}}">
    <p><img src="{{$value.onePhoto}}"></p>
    <p class="introduce-name">{{$value.name}}</p>
    <p class="introduce-money">￥{{$value.price}}.00 <span>| 已售：{{$value.salenum}}</span></p>
</ul>
{{/each}}