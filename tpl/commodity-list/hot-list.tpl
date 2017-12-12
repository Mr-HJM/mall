{{each}}
<li class="fl clearfix" data-id="{{$value.id}}">
    <img class="fl" src="{{$value.onePhoto}}">
    <div class="hot-detail fr">
        <span>{{$value.name}}</span>
        <b>特价：<i>￥{{$value.price}}.00</i></b>
        <p class="now-buy">立即抢购</p>
    </div>
</li>
{{/each}}