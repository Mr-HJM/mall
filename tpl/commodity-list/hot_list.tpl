{{each}}
<li class="fl clearfix" data-id="{{$value.id}}">
    <img class="fl" src="{{$value.onePhoto}}">
    <div class="fr">
        <span>{{$value.name}}</span>
        <b>￥{{$value.price}}.00</b>
    </div>
</li>
{{/each}}