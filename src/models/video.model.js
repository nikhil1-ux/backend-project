import mongoose, {schema} from "mongoose"
import mongooseAggreagatePaginate from "mongoose-aggregate-paginatev-2"

const videoSchema= new Schema ({

  videosFile: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },
  
  description: {
    type: String,
    required: true,
  },
  duration:{
   type: Number,
   required: true,
  },

}
  ,
  {
    timestamps: true,
  }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const video= mongoose.model("video",videoSchema)