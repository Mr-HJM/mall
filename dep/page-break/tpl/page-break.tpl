<div class="page">
    <a href="javascript:void(0);" data-num={{pre}}><</a>
    {{each data}}
     <a href="javascript:void(0);" data-num={{$value}}>{{$value}}</a>
    {{/each}}
    <a href="javascript:void(0);" data-num={{next}}>></a>
    <span class="appoint">
	跳至
	<input type="text" value="1">
	页
    <a class="jump" href="javascript:void(0);">跳转</a>
    </span>
</div>