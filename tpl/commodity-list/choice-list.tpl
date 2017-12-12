{{each}}
	<div class="list-choice fl" data-id="{{$value.id}}">
        <img src="{{$value.onePhoto}}">
        <p class="list-name">{{$value.name}}</p>
        <div class="list-cont clearfix">
            <span class="list-money fl">￥{{$value.price}}.00</span>
            <span class="list-num fr"><b>{{$value.remarkNum || '0'}}</b>人评价</span>
        </div>
    </div>
{{/each}}