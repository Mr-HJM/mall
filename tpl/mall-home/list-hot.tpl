{{each}}
	<li class="sg fl" data-id="{{$value.id}}"><img src="{{$value.onePhoto}}"><span class="name">{{$value.name}}</span><span class="money">￥{{$value.price}}.00</span></li>
{{/each}}