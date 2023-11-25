import { useEffect, useState } from 'react';
import { RiPingPongFill } from "react-icons/ri";
import { IoIosArrowRoundUp } from "react-icons/io";
import { IoIosArrowRoundDown } from "react-icons/io";
import './App.css'

interface gameObj{
  width: number,
  height: number,
  x: number,
  y: number,
  yVelocity: number,
  xVelocity: number
}

function App() {

  const [display_game_start, set_display_game_start] = useState(false);
  let game_start: boolean = false;

  let play_ai: boolean = false;

  const[player_wins, set_player_wins] = useState(false);
  const[ai_wins, set_ai_wins] = useState(false);

  const [player_scored, set_player_scored] = useState(false);
  const [ai_scored, set_ai_scored] = useState(false);

  const [display_player_score, set_display_player_score] = useState(0);
  const [display_ai_score, set_display_ai_score] = useState(0);
  let player_score: number = 0;
  let ai_score: number = 0;
  const final_score: number = 11;

  let canvasCtx: CanvasRenderingContext2D | null = null;

  const canvas_width: number = 1024;
  const canvas_height: number = 576;
  const paddle_width: number = 10;
  const paddle_height: number = 60;
  const paddle_wall_padding: number = 15;
  const pong_ball_size: number = 10;

  const paddle_velocity: number = 9;//4.5;
  const ball_velocity: number = 7.5;//3.75;

  const og_ai_mode_velocity: number = 6.12;//3.06;
  let ai_mode_velocity: number = og_ai_mode_velocity;

  const player_paddle: gameObj = {
    width: paddle_width,
    height: paddle_height,
    x: paddle_wall_padding,
    y: (canvas_height/2)-(paddle_height/2),
    yVelocity: 0,
    xVelocity: 0
  };

  const ai_paddle: gameObj = {
    width: paddle_width,
    height: paddle_height,
    x: canvas_width-paddle_wall_padding-paddle_width,
    y: (canvas_height/2)-(paddle_height/2),
    yVelocity: 0,
    xVelocity: 0
  };

  const ball: gameObj = {
    width: pong_ball_size,
    height: pong_ball_size,
    x: (canvas_width/2)-(pong_ball_size/2),
    y: (canvas_height/2)-pong_ball_size,
    yVelocity: 0,
    xVelocity: 0
  };

  //on init
  useEffect(() => {
    //add keydown listen for player inputs
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    //getting canvas
    const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    canvasCtx = ctx;

    //call update to begin rendering canvas elements
    requestAnimationFrame(update);
  }, []);

  //timeout function for delays
  function timeout(delay: number){
    return new Promise(res => setTimeout(res, delay));
  }

  //inputs
  function handleKeyDown(event: KeyboardEvent){
    //move player paddle
    if(game_start){
      if(event.key === 'w'){
        player_paddle.yVelocity = -paddle_velocity;
      }
      if(event.key === 's'){
        player_paddle.yVelocity = paddle_velocity;
      }

      //move ai paddle
      if(event.key === 'ArrowUp' && !play_ai){
        ai_paddle.yVelocity = -paddle_velocity;
      }
      if(event.key === 'ArrowDown' && !play_ai){
        ai_paddle.yVelocity = paddle_velocity;
      }
    }

    //start game with 2 players
    if(event.key === ' ' && !game_start){
      game_start = true;
      set_display_game_start(game_start);
      play_ai = false;
      setupPoint();
    }

    //start game with AI
    if(event.key === 'Backspace' && !game_start){
      game_start = true;
      set_display_game_start(game_start);
      play_ai = true;
      setupPoint();
    }
  }
  function handleKeyUp(event: KeyboardEvent){
    //stop player paddle
    if((event.key === 'w' && player_paddle.yVelocity < 0) || (event.key === 's' && player_paddle.yVelocity > 0)){
      player_paddle.yVelocity = 0;
    }

    //stop ai paddle
    if((event.key === 'ArrowUp' && ai_paddle.yVelocity < 0) || (event.key === 'ArrowDown' && ai_paddle.yVelocity > 0)){
      ai_paddle.yVelocity = 0;
    }
  }

  //out of bounds checking
  function outOfBoundsY(obj: gameObj): boolean{
    if(obj.y < 0 || obj.y > canvas_height-obj.height){
      return true;
    }
    return false;
  }
  function outOfBoundsX(obj: gameObj): boolean{
    if(obj.x < 0){
      ai_score += 1;
      set_display_ai_score(ai_score);
      set_ai_scored(true);
      return true;
    }
    else if(obj.x > canvas_width-obj.width){
      player_score += 1;
      set_display_player_score(player_score);
      set_player_scored(true);
      return true;
    }
    return false;
  }

  //hit paddle checking
  function hitPlayerPaddleX(paddle1: gameObj, ball: gameObj){
    //paddle 1
    if((ball.x < paddle1.x+paddle1.width && ball.x > paddle1.x) && (ball.y > paddle1.y && ball.y < paddle1.y+paddle1.height) && ball.xVelocity < 0){
      return true;
    }
    return false;
  }

  function hitAIPaddleX(paddle: gameObj, ball: gameObj){
    if((ball.x > paddle.x-paddle.width && ball.x < paddle.x) && (ball.y > paddle.y && ball.y < paddle.y+paddle.height) && ball.xVelocity > 0){
      return true;
    }
    return false;
  }

  //setup for playing a new point 
  async function setupPoint(){
    await timeout(750);
    set_player_scored(false);
    set_ai_scored(false);
    await timeout(250);
    ball.x = (canvas_width/2)-(pong_ball_size/2);
    ball.y = Math.random() * ((canvas_height-pong_ball_size) - 0 + 1) + 0;
    ball.xVelocity = Math.random() < 0.5 ? ball_velocity : -ball_velocity;
    ball.yVelocity = ball_velocity;
  }

  //display who won and reset game
  async function gameFinal(){
    if(player_score === final_score){
      set_player_wins(true);
    }
    else if(ai_score === final_score){
      set_ai_wins(true);
    }
    await timeout(3000);
    resetGame();
  }

  //reset game when finished
  function resetGame(){
    play_ai = true;
    game_start = false;
    set_player_wins(false);
    set_ai_wins(false);
    set_player_scored(false);
    set_ai_scored(false);
    set_display_game_start(game_start);
    player_score = 0;
    ai_score = 0;
    set_display_player_score(player_score);
    set_display_ai_score(ai_score);
    ball.x = (canvas_width/2)-(pong_ball_size/2);
    ball.y = (canvas_height/2)-pong_ball_size;
    ball.xVelocity = 0;
    ball.yVelocity = 0;
    ai_mode_velocity = og_ai_mode_velocity;
    player_paddle.yVelocity = 0;
    ai_paddle.yVelocity = 0;
    player_paddle.y = (canvas_height/2)-(paddle_height/2);
    ai_paddle.y = (canvas_height/2)-(paddle_height/2);
  }

  //rendering/game loop 
  async function update(){
    //clear canvas before rendering other elements
    canvasCtx!.clearRect(0, 0, canvas_width, canvas_height);

    //draw center line
    canvasCtx!.strokeStyle = "white";
    canvasCtx!.lineWidth = 4;
    canvasCtx!.setLineDash([5, 8]);
    canvasCtx!.beginPath();
    canvasCtx!.moveTo(canvas_width/2, 0);
    canvasCtx!.lineTo(canvas_width/2, canvas_height);
    canvasCtx!.stroke();

    //paddles
    canvasCtx!.fillStyle = "white";
    //y velocity, and check if paddle is going out of bounds
    //player paddle
    player_paddle.y += player_paddle.yVelocity;
    if(outOfBoundsY(player_paddle)){
      player_paddle.y -= player_paddle.yVelocity;
    }
    canvasCtx!.fillRect(player_paddle.x, player_paddle.y, player_paddle.width, player_paddle.height);
    //ai paddle
    //ai paddle logic
    if(play_ai){
      if(player_score === 4) ai_mode_velocity = 6.28;//3.14;
      else if(player_score === 8) ai_mode_velocity = 6.44;//3.22;
      else if(player_score === 10) ai_mode_velocity = 6.5;//3.25;

      if(ai_paddle.y+(ai_paddle.height/2) > ball.y){
        if(ball.xVelocity < 0) ai_paddle.yVelocity = -ai_mode_velocity/2.5;
        else ai_paddle.yVelocity = -ai_mode_velocity;
      }
      if(ai_paddle.y+(ai_paddle.height/2) < ball.y){
        if(ball.xVelocity < 0) ai_paddle.yVelocity = ai_mode_velocity/2.5;
        else ai_paddle.yVelocity = ai_mode_velocity;
      }
    }

    ai_paddle.y += ai_paddle.yVelocity;
    if(outOfBoundsY(ai_paddle)){
      ai_paddle.y -= ai_paddle.yVelocity;
    }
    canvasCtx!.fillRect(ai_paddle.x, ai_paddle.y, ai_paddle.width, ai_paddle.height);
  
    //pong ball
    canvasCtx!.fillStyle = "white";
    ball.y += ball.yVelocity;
    ball.x += ball.xVelocity;

    if(hitPlayerPaddleX(player_paddle, ball)){
      const rel_intersect_y = (player_paddle.y+(player_paddle.height/2))-ball.y;
      const norm_rel_intersection_y = (rel_intersect_y/(player_paddle.height/2));
      const bounce_angle = norm_rel_intersection_y * 1.3;
      ball.xVelocity = (ball_velocity+1.5) * Math.cos(bounce_angle);
      if(ball.xVelocity < 0) ball.xVelocity = -ball.xVelocity;
      ball.yVelocity = (ball_velocity+1.5) *- Math.sin(bounce_angle);
    }
    if(hitAIPaddleX(ai_paddle, ball)){
      const rel_intersect_y = (ai_paddle.y+(ai_paddle.height/2))-ball.y;
      const norm_rel_intersection_y = (rel_intersect_y/(ai_paddle.height/2));
      const bounce_angle = norm_rel_intersection_y * 1.3;
      ball.xVelocity = (ball_velocity+1.5) * Math.cos(bounce_angle);
      if(ball.xVelocity > 0) ball.xVelocity = -ball.xVelocity;
      ball.yVelocity = (ball_velocity+1.5) *- Math.sin(bounce_angle);
    }
    canvasCtx!.fillRect(ball.x, ball.y, pong_ball_size, pong_ball_size);

    //check X Y bounds for ball, invert velocity on hit
    if(outOfBoundsY(ball)){
      ball.yVelocity = -ball.yVelocity;
    }
    //stop ball, setup for next point
    if(outOfBoundsX(ball)){
      ball.x -= ball.xVelocity; // / ball_velocity;
      ball.xVelocity = 0;
      ball.yVelocity = 0;
      if(player_score < final_score && ai_score < final_score){
        setupPoint();
      }
    }

    //if either player has reached the score limit, end the game
    if(player_score === final_score || ai_score === final_score){
      gameFinal();
    }

    //create loop for constant canvas refresh
    requestAnimationFrame(update);
  }

  return (
    <>
      <div className='flex items-center w-screen h-screen'>
        {/*Score Popups*/}
        <div className='h-full w-1/2 rotate-180 z-10'>
          <div className={`h-full bg-blue-300 ease-out duration-500 ${player_scored ? 'opacity-40' : 'opacity-0'} ${player_scored ? 'w-full' : 'w-0'}`}>
            <div className='flex items-center justify-center w-full h-full rotate-180'>
              {display_game_start && <p className='text-10xl text-white font-jost italic'>{display_player_score}</p>}
            </div>
          </div>
        </div>
        <div className='h-full w-1/2 z-10'>
          <div className={`h-full bg-blue-300 ease-out duration-500 ${ai_scored ? 'opacity-40' : 'opacity-0'} ${ai_scored ? 'w-full' : 'w-0'}`}>
            <div className='flex items-center justify-center w-full h-full'>
              {display_game_start && <p className='text-10xl text-white font-jost italic'>{display_ai_score}</p>}
            </div>
          </div>
        </div>

        {/*Pong Screen*/}
        <div className='flex flex-col justify-center items-center w-full h-3/4 absolute'>
          <div className='flex items-center h-16 space-x-4 z-20'>
            {!display_game_start &&
              <>
                <RiPingPongFill className='text-5xl'></RiPingPongFill>
                <h1 className='text-6xl font-jost italic select-none'>Pong</h1>
                <RiPingPongFill className='text-5xl rotate-90'></RiPingPongFill>
              </>
            }
          </div>
          <div className='flex items-center justify-center h-8 space-x-96 w-full z-20'>
            {display_game_start && <p className='text-2xl font-jost italic select-none'>{display_player_score}</p>}
            {display_game_start && <p className='text-2xl font-jost italic select-none'>{display_ai_score}</p>}
          </div>
          {/*Pong Canvas*/}
          <canvas id='pong-canvas' width={canvas_width} height={canvas_height} className='bg-blue-100 z-0'></canvas>
          <div className='flex items-center justify-center h-16 z-20'>
            <div className='flex flex-col items-center pt-5'>
              {!display_game_start && <h1 className='font-semibold font-jost italic select-none'>Press 'Space': 2 Players</h1>}
              {!display_game_start && <h1 className='font-semibold font-jost italic select-none'>Press 'Delete': vs Computer</h1>}
            </div>
            {player_wins && <h1 className='font-semibold font-jost italic select-none'>Player 1 wins!</h1>}
            {ai_wins && <h1 className='font-semibold font-jost italic select-none'>Player 2 wins!</h1>}
          </div>

          {/*Controls*/}
          <div className='flex items-center justify-center h-16 w-3/5 pt-20'>
            {!display_game_start &&
              <>
                <div className='flex flex-col items-center w-1/2'>
                  <div className='flex items-center pb-3'>
                    <div className='pr-3'>
                      <p className='flex items-center justify-center w-12 h-12 border-4 border-gray-200 rounded text-xl font-jost select-none'>W</p>
                    </div>
                    <p className='text-xl font-semibold font-jost select-none'>&uarr;</p>
                  </div>
                  <div className='flex items-center'>
                    <div className='pr-3'>
                      <p className='flex items-center justify-center w-12 h-12 border-4 border-gray-200 rounded text-xl font-jost select-none'>S</p>
                    </div>
                    <p className='text-xl font-semibold font-jost select-none'>&darr;</p>
                  </div>
                </div>
                <div className='flex flex-col items-center w-1/2'>
                  <div className='flex items-center pb-3'>
                    <p className='text-xl font-semibold font-jost select-none'>&uarr;</p>
                    <div className='pl-3'>
                      <IoIosArrowRoundUp className='flex items-center justify-center w-12 h-12 border-4 border-gray-200 rounded text-xl font-semibold font-jost select-none'></IoIosArrowRoundUp>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <p className='text-xl font-semibold font-jost select-none'>&darr;</p>
                    <div className='pl-3'>
                      <IoIosArrowRoundDown className='flex items-center justify-center w-12 h-12 border-4 border-gray-200 rounded text-xl font-semibold font-jost select-none'></IoIosArrowRoundDown>
                    </div>
                  </div>
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default App
