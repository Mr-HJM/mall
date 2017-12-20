{{each}}
<li class="fl clearfix" data-id="{{$value.id}}">
    <img class="fl" src="{{$value.onePhoto}}">
    <div class="fr">
        <span class="val-name">{{$value.name}}</span>
        <b>￥{{$value.price}}.00</b>
        <span class="sale-num">销量：<span>{{$value.salenum || '0'}}</span></span>
    </div>
</li>
{{/each}}