<?php 
/*
Before go live
Change urlToScrap
*/
// get the address from a website and buy the contract using ethersjs
$shouldContinue = true;
$tryCount = 0;
while($shouldContinue) {
	// Uncomment this and add coin launch timestamp so that your can sleep while the script does it's work
	/*if( time() < 1621906800 ) {
		echo "Not yet time \n";
		sleep(10);
		continue;
	}*/

	$urlToScrap = "https://elondoge.io/";
	
	$pageContents = file_get_contents($urlToScrap);
	preg_match_all('#\bhttps?://[^,\s()<>]+(?:\([\w\d]+\)|([^,[:punct:]\s]|/))#', $pageContents, $urls);
	$urls = $urls[0];

	// Quick and dirty hack, We will check if any word is of 40 or 42(0x) chars
	$tokensFound = array();
	foreach ($urls as $url) {
		$urlArray = explode("/", $url); 
		//print_r($urlArray);exit;
		foreach( $urlArray as $urlElement ) {
			$tokenAddress = "";
			if(strlen($urlElement) == 40) {
				$tokenAddress = "0x" . $urlElement;
	    } else if(strlen($urlElement) == 42) {
	    	$tokenAddress = $urlElement;
	    }
	    if( !empty($tokenAddress) ) {

	    	if( $tokenAddress == "0x000000000000000000000000000000000000dead" || strpos($tokenAddress, ".") !== false ) {
	    		// VERY VERY IMPORTANT
	    		continue;
	    	}
	    	if( !isset($tokensFound[$tokenAddress]) ) {
	    		$tokensFound[$tokenAddress] = 0;
	    	}
	    	$tokensFound[$tokenAddress]++;
	    }
		}
	}

	if( !empty($tokensFound) ) {
		// We will use that token address that has most occurrences
		arsort($tokensFound);
		$tokenToBuy = key($tokensFound);

		echo "BUYING THIS TOKEN: $tokenToBuy \n";
		$commandToBuy = "node ./pancakeswap/index.js $tokenToBuy";
		//echo $commandToBuy;exit;
		passthru($commandToBuy);
		$shouldContinue = false;
	}
	echo "TRY NO: $tryCount\n";
	$tryCount++;
	sleep(1);
}
?>