import { Search, ArrowBigUp, ArrowBigDown, MessageSquare, Clock, User } from "lucide-react";

const communityPosts = [
  {
    id: 1,
    title: "Looking for a 3rd roommate in Beardslee Blvd apartment! 🐾 Pet friendly",
    category: "Roommate Needed",
    upvotes: 45,
    replies: 12,
    poster: "UWBDawg24",
    timePosted: "2 hours ago",
    preview: "Hey everyone! My current roommate and I (both junior CS majors) are looking for a third person to join our lease at the Beardslee Blvd apartments starting this Fall. Rent would be around $850/mo. We have a very friendly golden retriever named Max. DM if interested!"
  },
  {
    id: 2,
    title: "Is anyone else having issues getting their deposit back from Apex Management?",
    category: "Housing Question",
    upvotes: 128,
    replies: 34,
    poster: "throwaway_tenant",
    timePosted: "5 hours ago",
    preview: "Moved out a month ago and left the place spotless. Now they're saying there's a $400 'mandatory cleaning fee' that wasn't in the lease. Has anyone dealt with this before? Thinking about taking them to small claims court."
  },
  {
    id: 3,
    title: "Free couch on 104th Ave NE if anyone wants it!",
    category: "General",
    upvotes: 89,
    replies: 7,
    poster: "SarahG",
    timePosted: "1 day ago",
    preview: "We're moving out today and couldn't fit our IKEA couch in the U-Haul. It's in decent condition, dark grey. Left it on the curb at the corner of 104th and Beardslee. First come first serve!"
  },
  {
    id: 4,
    title: "Best internet provider for the Mill Creek area?",
    category: "Housing Question",
    upvotes: 22,
    replies: 15,
    poster: "TransferStudent23",
    timePosted: "1 day ago",
    preview: "Just signed a lease for a place in Mill Creek. Xfinity and Ziply are both available. We'll have 4 people streaming and gaming pretty regularly. What do you guys recommend?"
  }
];

const categoryColors: Record<string, string> = {
  "Roommate Needed": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Housing Question": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "General": "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">💬 Community Hub</h1>
          <p className="mt-2 text-pink-100/60">Connect, ask questions, and find roommates</p>
        </div>
        
        <div className="flex w-full flex-col sm:flex-row md:w-auto items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-300/50" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="w-full rounded-xl border border-pink-300/20 bg-pink-500/10 py-3 pl-10 pr-4 text-sm text-pink-100 placeholder:text-pink-300/40 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400 transition-colors"
            />
          </div>
          <button className="w-full sm:w-auto shrink-0 rounded-xl bg-gradient-to-r from-pink-500 to-purple-700 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/20 transition-all hover:-translate-y-0.5 hover:shadow-pink-500/40">
            + New Post
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-10 flex flex-wrap gap-3">
        {["Top Posts", "New", "Roommate Needed", "Housing Question", "General"].map((category) => (
          <button
            key={category}
            className="rounded-full border border-pink-300/20 bg-pink-500/10 px-5 py-2 text-sm font-medium text-pink-200 transition hover:bg-pink-500/20 hover:text-white"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Posts List (Reddit Style) */}
      <div className="flex flex-col gap-4">
        {communityPosts.map((post) => (
          <div 
            key={post.id}
            className="group flex overflow-hidden rounded-2xl border border-pink-300/10 bg-pink-500/5 backdrop-blur-sm transition-all duration-300 hover:border-pink-300/30 hover:bg-pink-500/10 cursor-pointer"
          >
            {/* Upvote Column */}
            <div className="flex w-16 flex-col items-center justify-start bg-pink-900/10 py-4 border-r border-pink-300/5 group-hover:bg-pink-900/20 transition-colors">
              <button className="text-pink-300/40 hover:text-pink-400 transition-colors">
                <ArrowBigUp className="h-6 w-6" />
              </button>
              <span className="my-1 text-sm font-bold text-pink-100">{post.upvotes}</span>
              <button className="text-pink-300/40 hover:text-purple-400 transition-colors">
                <ArrowBigDown className="h-6 w-6" />
              </button>
            </div>

            {/* Post Content */}
            <div className="flex flex-col flex-1 p-4 sm:p-5">
              {/* Post Meta */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2 text-xs">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold ${categoryColors[post.category]}`}>
                  {post.category}
                </span>
                <span className="text-pink-100/40 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  u/{post.poster}
                </span>
                <span className="text-pink-100/40 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.timePosted}
                </span>
              </div>

              {/* Title & Preview */}
              <h2 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-pink-100/60 line-clamp-3 leading-relaxed mb-4">
                {post.preview}
              </p>

              {/* Action Footer */}
              <div className="mt-auto flex items-center gap-4">
                <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-pink-100/50 hover:bg-pink-500/10 hover:text-pink-300 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  {post.replies} Replies
                </button>
                <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-pink-100/50 hover:bg-pink-500/10 hover:text-pink-300 transition-colors">
                  Share
                </button>
                <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-pink-100/50 hover:bg-pink-500/10 hover:text-pink-300 transition-colors">
                  Save
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
