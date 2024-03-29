import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState } from "react";
import moment from "moment";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { currentUser } = useContext(AuthContext);


  const { isLoading, error, data } = useQuery({
    queryKey: ["likes", post.Pid],
    queryFn: () => makeRequest.get(`/likes?postId=${post.Pid}`).then(res => res.data),
    
  });
  
// console.log("post id is:",post.Pid)
  // console.log("data is:",data)

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (liked) => {
      // Depending on the 'liked' state, either post a new like or delete an existing one
      if (liked) {
        // If 'liked' is true, it means the user wants to unlike the post
        return makeRequest.delete(`/likes?postId=${post.Pid}`);
      } else {
        // If 'liked' is false, it means the user wants to like the post
        return makeRequest.post("/likes", { postId: post.Pid });
      }
    },
    onSuccess: () => {
      // After successfully liking/unliking, invalidate and refetch the 'likes' query to update the UI
      queryClient.invalidateQueries(["likes"]);
    },
  });
  
// updated post

  const deleteMutation = useMutation({
    mutationFn: (Pid) => {
        return makeRequest.delete(`/posts/`+ Pid);
    },
    onSuccess: () => {
  
      queryClient.invalidateQueries(["posts"]);
    },
});

const handleDelete = () => {
  deleteMutation.mutate(post.Pid);
};

  const handleLike = () => {
    console.log(currentUser.id)
    mutation.mutate(data.includes(currentUser.id));
  };

  
    // Check if media is available
    const mediaCheck = post.img;


  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={"/upload/"+post.profilePic} alt="" />
            {/* <img src={post.profilePic} alt="" /> */}

            <div className="details">
              <Link
                 to={`/profile/${post.Puserid}`}
                //to={'/profile/'}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.name}</span>
              </Link>
              <span className="date">{moment(post.createdAt).fromNow()}</span>
              {/* <span className="date">1 min ago</span> */}
            </div>

          </div>
          {/* <MoreHorizIcon  /> */}
           <MoreHorizIcon onClick={() => {setMenuOpen(!menuOpen)
          
          }} />
          {menuOpen && post.Puserid === currentUser.id && (
            <button onClick={handleDelete}>delete</button>
          )} 
        </div>
        <div className="content">
    
          <p>{post.Postdesc}</p>
          

          {/* <img src={"/upload/" + post.img} alt="" /> */}
          

          {/* Render the media section if media is available */}
          {mediaCheck && (
            <div>
              {mediaCheck.endsWith('.jpg') || mediaCheck.endsWith('.png') || mediaCheck.endsWith('.jpeg') ? (
                <img src={`/upload/${mediaCheck}`} alt="Image" />
              ) : (
                <video controls>
                  <source src={`/upload/${mediaCheck}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

        </div>
        <div className="info">
          <div className="item">
            {isLoading ? (
              "loading"
            ) : data.includes(currentUser.id) ? (
              <FavoriteOutlinedIcon
                style={{ color: "red" }}
                onClick={handleLike}
              />
            ) : (
              <FavoriteBorderOutlinedIcon 
               onClick={handleLike} 
              />
            )}
            {data?.length} Likes

          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
          {/* <div className="item" > */}
            <TextsmsOutlinedIcon />
            See Comments
          </div>
          <div className="item">
            <ShareOutlinedIcon />
            Share
          </div>
        </div>
        {commentOpen && <Comments postId={post.Pid} />}
      </div>
    </div>
  );
};

export default Post;
