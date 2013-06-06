<?
 
require('settings.php');

$fetch = clean($_POST['fetch']);
switch($fetch) {
	case 'tweets':
		$q = clean($_POST['word']); 
		$locations = '-180,-90,180,90'; 
		$rpp = '100'; 
		$lang = clean($_POST['lang']); 
		// $getfield = '?q='.$q.'&locations='.$locations.'&count='.$rpp.'&lang='.$es;
		$getfield = '?q='.$q.'&count='.$rpp.'&lang='.$lang;
		$twitter = new TwitterAPIExchange($settings);
		echo $twitter->setGetfield($getfield)
					 ->buildOauth($url, $requestMethod)
					 ->performRequest(); 
		break; 
	case 'words':
		break; 
	default:
		echo ''; 
		break; 
}
  
function clean($str) { return htmlentities(stripslashes($str)); }

?>