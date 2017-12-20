{{each}}
	<li class="clearfix">
		<div class="user-column fl">
			<div class="user-info">
				<img src="{{$value.userPhoto || '//misc.360buyimg.com/user/myjd-2015/css/i/peisong.jpg'}}" width="25" height="25" class="avatar">
				<span>{{$value.nickName}}</span>
			</div>
		</div>
		<div class="comment-column">
			{{if $value.satisfactionLevel >= '4'}}
			<div class="comment-star">好评</div>
			{{else if $value.satisfactionLevel == '3' || $value.satisfactionLevel == '2'}}
			<div class="comment-star">中评</div>
			{{else}}
			<div class="comment-star">差评</div>
			{{/if}}
			<p class="comment-con">{{$value.content}}</p>
			<div class="comment-message">
				<span>{{$value.createTime}}</span>
			</div>
		</div>
	</li>
{{/each}}