{{each}}
<div class="right-list fl" data-id={{$value.id}}>
    <img src="{{$value.onePhoto}}">
    <p class="right-list-name">{{$value.name}}</p>
    <div class="right-list-cont clearfix">
        <span class="right-list-money fl">￥{{$value.price}}</span>
        <span class="right-list-num fr">已售<b>{{$value.salenum}}</b></span>
    </div>
</div>
{{/each}}