// ...imports stay the same
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const API_BASE = "http://localhost:3000";
const number = (n) => (n ?? 0).toLocaleString();

const StatCard = ({ title, value, sub }) => (
  <Card className="w-full">
    <CardHeader className="pb-2">
      <CardTitle className="text-base text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{number(value)}</div>
      {sub ? <div className="text-xs text-muted-foreground mt-1">{sub}</div> : null}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { user } = useSelector((s) => s.auth);

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBlockId, setLoadingBlockId] = useState(null);

  // ✅ role-aware admin check
  const isAdmin = (user?.role === "admin") || (user?.isAdmin === true);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/v1/admin/stats`, {
        withCredentials: true,
      });
      setStats(res.data);
    } catch (e) {
      console.log(e);
      toast.error(e?.response?.data?.message || "Failed to load stats");
    }
  };

  const fetchUsers = async (page = meta.page, query = search) => {
    setLoading(true);
    try {
      const url = `${API_BASE}/api/v1/admin/users?page=${page}&limit=${meta.limit}&search=${encodeURIComponent(
        query || ""
      )}`;
      const res = await axios.get(url, { withCredentials: true });
      setUsers(res.data.users || []);
      setMeta({
        page: res.data.page,
        limit: res.data.limit,
        total: res.data.total,
        pages: res.data.pages,
      });
    } catch (e) {
      console.log(e);
      toast.error(e?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // ✅ fetch when admin is confirmed (role or legacy flag)
  useEffect(() => {
    if (!isAdmin) return;
    fetchStats();
    fetchUsers(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const onSearch = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    fetchUsers(1, search);
  };

  const blockToggle = async (id, value) => {
    try {
      setLoadingBlockId(id);
      const res = await axios.patch(
        `${API_BASE}/api/v1/admin/users/${id}/block`,
        { value },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (String(u._id) === String(id) ? { ...u, isBlocked: value } : u))
        );
        toast.success(res.data.message);
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.response?.data?.message || "Failed to update user status");
    } finally {
      setLoadingBlockId(null);
    }
  };

  const next = () => meta.page < meta.pages && fetchUsers(meta.page + 1, search);
  const prev = () => meta.page > 1 && fetchUsers(meta.page - 1, search);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage users, see platform stats, and moderate activity.</p>
      </div>

      {/* If user is not admin */}
      {!isAdmin ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">You don’t have admin access.</div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Users"
              value={stats?.users?.totalUsers}
              sub={`${number(stats?.users?.adminUsers)} admins • ${number(stats?.users?.blockedUsers)} blocked`}
            />
            <StatCard
              title="Blogs"
              value={stats?.blogs?.totalBlogs}
              sub={`${number(stats?.blogs?.publishedBlogs)} published`}
            />
            <StatCard title="Blog Likes" value={stats?.blogs?.totalLikes} />
            <StatCard title="Comments" value={stats?.comments?.totalComments} />
          </div>

          {/* Top Authors */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Top Authors</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.topAuthors?.length ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stats.topAuthors.map((a) => (
                    <div key={a.userId} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="font-medium">{a.firstName} {a.lastName}</div>
                        <div className="text-xs text-muted-foreground">{a.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">Blogs: <span className="font-semibold">{a.blogCount}</span></div>
                        <div className="text-sm">Likes: <span className="font-semibold">{a.likeSum}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No data yet.</div>
              )}
            </CardContent>
          </Card>

          {/* Users */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Users</CardTitle>
              <form onSubmit={onSearch} className="flex gap-2">
                <Input
                  placeholder="Search name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
                <Button type="submit" disabled={loading}>Search</Button>
              </form>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>
                    {meta.total ? `Showing page ${meta.page} of ${meta.pages} (${meta.total} users)` : "No users found"}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Blogs</TableHead>
                      <TableHead>Comments Written</TableHead>
                      <TableHead>Comments on Blogs</TableHead>
                      <TableHead>Blog Likes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={u.photoUrl} />
                              <AvatarFallback>{(u.firstName?.[0] || "U") + (u.lastName?.[0] || "")}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{u.firstName} {u.lastName}</span>
                              <span className="text-xs text-muted-foreground">{u.occupation || "—"}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{u.email}</TableCell>
                        <TableCell>{number(u.blogCount)}</TableCell>
                        <TableCell>{number(u.commentsWritten)}</TableCell>
                        <TableCell>{number(u.commentsOnBlogs)}</TableCell>
                        <TableCell>{number(u.totalBlogLikes)}</TableCell>
                        <TableCell>
                          {u.isAdmin ? (
                            <Badge>Admin</Badge>
                          ) : u.isBlocked ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : (
                            <Badge variant="secondary">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!u.isAdmin && (
                            <Button
                              variant={u.isBlocked ? "secondary" : "destructive"}
                              size="sm"
                              disabled={loadingBlockId === u._id}
                              onClick={() => blockToggle(u._id, !u.isBlocked)}
                            >
                              {u.isBlocked ? "Unblock" : "Block"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  {meta.total ? `Total: ${number(meta.total)}` : ""}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={prev} disabled={loading || meta.page <= 1}>Previous</Button>
                  <Button variant="outline" onClick={next} disabled={loading || meta.page >= meta.pages}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
