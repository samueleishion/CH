<?
header("Access-Control-Allow-Origin: *");
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
		$twitter_feed = $twitter->setGetfield($getfield)
					 ->buildOauth($url, $requestMethod)
					 ->performRequest(); 
		$json_tweets = json_decode("".$twitter_feed); 
		foreach($json_tweets as $tweet) {
			// print_r($tweet); 
			for($i = 0; $i < count($tweet)-1; $i++) { 
				if(isset($tweet[$i]->geo)) { 
					$word = $q; 
					$tweet_id = intval($tweet[$i]->id_str); 
					$tweet_text = $tweet[$i]->text; 
					$screen_name = $tweet[$i]->user->screen_name; 
					$lat = $tweet[$i]->geo->coordinates[0]; 
					$lng = $tweet[$i]->geo->coordinates[1]; 
					$language = $tweet[$i]->lang; 
					$country = $tweet[$i]->place->country; 

					if($lat!=0 && $lng!=0)
						mysqli_query($dblink,"INSERT INTO tweets (word,tweet_id,tweet,user,lat,lng,lang,country) VALUES ('$word','$tweet_id','$tweet_text','$screen_name','$lat','$lng','$lang','$country')"); 
				}
			}
		}
		echo $twitter_feed; 
		break; 
	case 'random':
		$offset_result = mysqli_query($dblink,"SELECT FLOOR(RAND()*COUNT(*)) AS 'offset' FROM tweets"); 
		$offset_row = mysqli_fetch_object($offset_result); 
		$offset = $offset_row->offset; 
		$result = mysqli_query($dblink,"SELECT word FROM tweets LIMIT $offset,1"); 
		$row = mysqli_fetch_array($result); 
		echo $row['word'];  
		break; 
	case 'words':
		break; 
	default:
		echo ''; 
		break; 
}
  
function clean($str) { return htmlentities(stripslashes($str)); }

?>