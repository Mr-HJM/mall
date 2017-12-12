{{each}}
<div class="commodity-left-list" data-id="{{$value.id}}">
    <img src="{{$value.onePhoto}}">
    <p class="left-list-name">{{$value.name}}</p>
    <p class="left-list-money">￥ {{$value.price}}.00</p>
    <p class="left-list-assess">已有 <b>{{$value.remarkNum || '0'}}</b> 人评价</p>
</div>
{{/each}}