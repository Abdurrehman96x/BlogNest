import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { LuSend } from "react-icons/lu";
import { Button } from './ui/button';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { setBlog } from '@/redux/blogSlice';
import { setComment } from '@/redux/commentSlice';
import { Edit, Trash2 } from 'lucide-react';
import { BsThreeDots } from "react-icons/bs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_BASE = import.meta.env.VITE_API_URL;

const CommentBox = ({ selectedBlog }) => {
  const { user } = useSelector(store => store.auth);
  const { comment } = useSelector(store => store.comment); // top-level comments with .replies (array)
  const { blog } = useSelector(store => store.blog);

  const [content, setContent] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  const dispatch = useDispatch();

  // helper: check like state regardless of ObjectId vs string
  const isLikedByMe = (likes = []) =>
    Array.isArray(likes) && likes.some(id => String(id) === String(user._id));

  useEffect(() => {
    const getAllCommentsOfBlog = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/v1/comment/${selectedBlog._id}/comment/all`);
        const data = res.data.comments || [];
        dispatch(setComment(data));
      } catch (error) {

      }
    };
    if (selectedBlog?._id) getAllCommentsOfBlog();
  }, [selectedBlog?._id, dispatch]);

  // === CREATE TOP-LEVEL COMMENT ===
  const submitTopLevelComment = async () => {
    try {
      const body = { content: content.trim() };
      if (!body.content) {
        toast.error('Please write something');
        return;
      }

      const res = await axios.post(
        `${API_BASE}/api/v1/comment/${selectedBlog._id}/create`,
        body,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );

      if (res.data.success) {
        // ensure newly added top-level comment has replies field for UI consistency
        const newTop = { ...res.data.comment, replies: [] };
        const updated = [...comment, newTop];
        dispatch(setComment(updated));

        // keep your existing blog slice logic for other parts of UI
        const updatedBlogData = blog.map(p =>
          p._id === selectedBlog._id ? { ...p, comments: updated } : p
        );
        dispatch(setBlog(updatedBlogData));

        toast.success(res.data.message);
        setContent('');
      }
    } catch (error) {

      const msg = error?.response?.data?.message || "Couldn't add comment";
      toast.error(msg);
    }
  };

  // === CREATE REPLY (uses parentId + replyText) ===
  const submitReply = async (parentId) => {
    try {
      const body = { content: replyText.trim(), parentId };
      if (!body.content) {
        toast.error('Please write a reply');
        return;
      }

      const res = await axios.post(
        `${API_BASE}/api/v1/comment/${selectedBlog._id}/create`,
        body,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );

      if (res.data.success) {
        const newReply = res.data.comment; // reply (no .replies)
        // insert into the correct top-level comment's replies
        const updated = comment.map(top => {
          if (String(top._id) === String(parentId)) {
            const nextReplies = Array.isArray(top.replies) ? [...top.replies, newReply] : [newReply];
            return { ...top, replies: nextReplies };
          }
          return top;
        });
        dispatch(setComment(updated));

        toast.success(res.data.message);
        setReplyText('');
        setActiveReplyId(null);
      }
    } catch (error) {

      const msg = error?.response?.data?.message || "Couldn't add reply";
      toast.error(msg);
    }
  };

  // === DELETE (works for both top-level and replies) ===
  const deleteCommentHandler = async (commentId) => {
    try {
      const res = await axios.delete(`${API_BASE}/api/v1/comment/${commentId}/delete`, {
        withCredentials: true
      });

      if (res.data.success) {
        // if it's a top-level comment, remove it
        // otherwise, remove it from whichever top-level's replies contains it
        const updated = comment
          .map(top => {
            if (String(top._id) === String(commentId)) {
              return null; // drop top-level
            }
            if (Array.isArray(top.replies) && top.replies.length) {
              const newReplies = top.replies.filter(r => String(r._id) !== String(commentId));
              if (newReplies.length !== top.replies.length) {
                return { ...top, replies: newReplies };
              }
            }
            return top;
          })
          .filter(Boolean);

        dispatch(setComment(updated));
        toast.success(res.data.message);
      }
    } catch (error) {

      toast.error("Failed to delete comment");
    }
  };

  // === EDIT (top-level only in this UI; extend similarly for replies if needed) ===
  const editCommentHandler = async (commentId, isReply = false, parentId = null) => {
    try {
      const res = await axios.put(
        `${API_BASE}/api/v1/comment/${commentId}/edit`,
        { content: editedContent },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        }
      );

      if (res.data.success) {
        let updated;
        if (!isReply) {
          updated = comment.map(item =>
            String(item._id) === String(commentId) ? { ...item, content: editedContent } : item
          );
        } else {
          updated = comment.map(top => {
            if (String(top._id) !== String(parentId)) return top;
            const newReplies = top.replies.map(r =>
              String(r._id) === String(commentId) ? { ...r, content: editedContent } : r
            );
            return { ...top, replies: newReplies };
          });
        }

        dispatch(setComment(updated));
        toast.success(res.data.message);
        setEditingCommentId(null);
        setEditedContent('');
      }
    } catch (error) {

      toast.error("Failed to edit comment");
    }
  };

  // === LIKE / UNLIKE (handles both top-level & replies in UI state) ===
  const likeCommentHandler = async (commentId) => {
    try {
      const res = await axios.get(`${API_BASE}/api/v1/comment/${commentId}/like`, {
        withCredentials: true,
      });

      if (res.data.success) {
        const updatedComment = res.data.updatedComment;

        const updatedList = comment.map(top => {
          if (String(top._id) === String(commentId)) {
            return updatedComment.replies ? updatedComment : { ...updatedComment, replies: top.replies || [] };
          }
          if (Array.isArray(top.replies) && top.replies.length) {
            const idx = top.replies.findIndex(r => String(r._id) === String(commentId));
            if (idx !== -1) {
              const newReplies = [...top.replies];
              newReplies[idx] = updatedComment;
              return { ...top, replies: newReplies };
            }
          }
          return top;
        });

        dispatch(setComment(updatedList));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Error liking comment", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div>
      <div className='flex gap-4 mb-4 items-center'>
        <Avatar>
          <AvatarImage src={user.photoUrl} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h3 className='font-semibold'>{user.firstName} {user.lastName}</h3>
      </div>

      <div className='flex gap-3'>
        <Textarea
          placeholder="Leave a comment"
          className="bg-gray-100 dark:bg-gray-800"
          onChange={(e) => setContent(e.target.value)}
          value={content}
        />
        <Button onClick={submitTopLevelComment} disabled={!content.trim()}>
          <LuSend />
        </Button>
      </div>

      {comment.length > 0 && (
        <div className='mt-7 bg-gray-100 dark:bg-gray-800 p-5 rounded-md'>
          {comment.map((item) => (
            <div key={item._id} className='mb-4'>
              <div className='flex items-center justify-between'>
                <div className='flex gap-3 items-start'>
                  <Avatar>
                    <AvatarImage src={item?.userId?.photoUrl} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className='mb-2 space-y-1 md:w-[400px]'>
                    <h1 className='font-semibold'>
                      {item?.userId?.firstName} {item?.userId?.lastName}
                      <span className='text-sm ml-2 font-light'>yesterday</span>
                    </h1>

                    {editingCommentId === item?._id ? (
                      <>
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="mb-2 bg-gray-200 dark:bg-gray-700"
                        />
                        <div className="flex py-1 gap-2">
                          <Button size="sm" onClick={() => editCommentHandler(item._id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                        </div>
                      </>
                    ) : (
                      <p>{item?.content}</p>
                    )}

                    <div className='flex gap-5 items-center'>
                      <div
                        className='flex gap-1 items-center cursor-pointer'
                        onClick={() => likeCommentHandler(item._id)}
                      >
                        {isLikedByMe(item.likes) ? <FaHeart fill='red' /> : <FaRegHeart />}
                        <span>{item.numberOfLikes}</span>
                      </div>

                      <p
                        onClick={() => {
                          setActiveReplyId(activeReplyId === item._id ? null : item._id);
                          setReplyText('');
                        }}
                        className='text-sm cursor-pointer'
                      >
                        Reply
                      </p>
                    </div>
                  </div>
                </div>

                {String(user._id) === String(item?.userId?._id) ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger><BsThreeDots /></DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[180px]">
                      <DropdownMenuItem onClick={() => { setEditingCommentId(item._id); setEditedContent(item.content); }}>
                        <Edit />Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500" onClick={() => deleteCommentHandler(item._id)}>
                        <Trash2 />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>

              {activeReplyId === item._id && (
                <div className='flex gap-3 w-full px-10 mt-3'>
                  <Textarea
                    placeholder="Reply here ..."
                    className="border-2 dark:border-gray-500 bg-gray-200 dark:bg-gray-700"
                    onChange={(e) => setReplyText(e.target.value)}
                    value={replyText}
                  />
                  <Button onClick={() => submitReply(item._id)} disabled={!replyText.trim()}>
                    <LuSend />
                  </Button>
                </div>
              )}

              {/* Render replies */}
              {Array.isArray(item.replies) && item.replies.length > 0 && (
                <div className="pl-10 mt-3 space-y-4">
                  {item.replies.map((rep) => (
                    <div key={rep._id} className="flex items-start justify-between">
                      <div className="flex gap-3 items-start">
                        <Avatar>
                          <AvatarImage src={rep?.userId?.photoUrl} />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className='space-y-1 md:w-[360px]'>
                          <h2 className='font-semibold'>
                            {rep?.userId?.firstName} {rep?.userId?.lastName}
                            <span className='text-sm ml-2 font-light'>yesterday</span>
                          </h2>

                          {editingCommentId === rep._id ? (
                            <>
                              <Textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="mb-2 bg-gray-200 dark:bg-gray-700"
                              />
                              <div className="flex py-1 gap-2">
                                <Button size="sm" onClick={() => editCommentHandler(rep._id, true, item._id)}>Save</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                              </div>
                            </>
                          ) : (
                            <p>{rep.content}</p>
                          )}

                          <div
                            className='flex gap-1 items-center cursor-pointer'
                            onClick={() => likeCommentHandler(rep._id)}
                          >
                            {isLikedByMe(rep.likes) ? <FaHeart fill='red' /> : <FaRegHeart />}
                            <span>{rep.numberOfLikes}</span>
                          </div>
                        </div>
                      </div>

                      {String(user._id) === String(rep?.userId?._id) ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger><BsThreeDots /></DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[180px]">
                            <DropdownMenuItem onClick={() => { setEditingCommentId(rep._id); setEditedContent(rep.content); }}>
                              <Edit />Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500" onClick={() => deleteCommentHandler(rep._id)}>
                              <Trash2 />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentBox;
